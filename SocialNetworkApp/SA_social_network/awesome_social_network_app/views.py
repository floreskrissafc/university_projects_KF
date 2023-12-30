from django.shortcuts import render, redirect
from .models import *
from .forms import *
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.http import HttpResponse
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.decorators import login_required
import logging
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.forms.models import model_to_dict
from itertools import chain
from .custom_functions import *
logger = logging.getLogger(__name__)

@login_required(login_url='login')
def index(request):
    '''Return the Home Page of the current logged in user. This page allows the
    user to create new posts, see a list of suggested friends, and shows the posts
    of all the users that user is currently following and its own posts as well.'''
    user = User.objects.get(username = request.user.username)
    user_profile = UserProfile.objects.get( user = request.user )
    # Get a list of the users being followed by the logged in user
    followed_users = getFollowedUsersList(user)
    # To include the posts of the current logged in user
    followed_users.append(user)
    # To get a list of the posts created by the users being followed by user
    post_list = getPostFeed(followed_users)
    # To show the form to create a POST
    post_form = PostUpdateForm() 
    # To show the follow sugggestions
    suggested_user_profiles = getSuggestedFriendsProfiles(followed_users, user)
    return render(request, 'awesome_social_network_app/index.html',{'user_profile' : user_profile, 
                                                                    'post_form': post_form,
                                                                    'post_list': post_list,
                                                                    'suggested_user_profiles': suggested_user_profiles,
                                                                    })

@login_required
def room(request, room_name):
    '''Return the ChatRoom object named room_name along with 
    the chats that belong to that ChatRoom.'''
    room = ChatRoom.objects.filter(name=room_name).first()
    chats = []
    if room:
        chats = Chat.objects.filter(room = room)
    else:
        room = ChatRoom(name = room_name)
        room.save()
    return render(request,'awesome_social_network_app/room.html', {'room_name': room_name, 
                                                                    'chats' : chats } )

@login_required
def message(request, room_name):
    '''Allow two user to talk privately. The room_name is a string containing the usernames
    of these two users.'''
    usernames = room_name.split('__')
    username1 = ""
    username2 = ""
    if usernames[0] == request.user.username:
        username1 = usernames[0]
        username2 = usernames[1]
    else:
        username1 = usernames[1]
        username2 = usernames[0]
    # First, make sure the room_name contains the username of the logged in user
    if ( request.user.username in room_name ):
        usernames_of_followed_users = []
        # users_being_followed = Following.objects.filter(followerUsername= request.user.username)
        users_being_followed = Following.objects.filter(followerUser= request.user)
        for following_obj in users_being_followed:
            # usernames_of_followed_users.append(following_obj.followedUsername)
            usernames_of_followed_users.append(following_obj.followedUser.username)
        usernames_of_followed_users = set(usernames_of_followed_users)

        # Second, make sure that the logged in user is trying to message someone
        # that is currently following
        if username2 in usernames_of_followed_users:
            if request.method == 'GET':
                # Return the chats that were previously created by these users in this chatroom
                room = ChatRoom.objects.filter(name=room_name).first()
                chats = []
                if room:
                    chats = Chat.objects.filter(room = room)
                else:
                    room = ChatRoom(name = room_name)
                    room.save()
                return render(request,'awesome_social_network_app/room.html', { 'room_name': room_name, 
                                                                                'chats' : chats } )
            else:
                return redirect('/')
        else:
            # Redirect them to the profile page of that person who they
            # want to message so they can follow this person first
            return redirect("/user_profile/" + username2 )    
    else:
        # The room_name provided should not be accessible to the current logged in user
        # because the chat room does not belong to this user. 
        user = User.objects.get(username = request.user.username)
        user_profile = UserProfile.objects.get( user = request.user )
        return render(request,'awesome_social_network_app/unaccessible_chat.html', {'user_profile' : user_profile})

def register(request):
    '''Function to register an user into the system'''
    registered = False
    if request.method == 'POST':
        user_form = UserForm(data=request.POST)
        if user_form.is_valid(): 
            user = user_form.save(commit=False)
            user.set_password(request.POST['password'])
            user.save()
            # once the new user is created, login inmediately 
            user_logged = authenticate(username=user.username, password=request.POST['password'])
            login(request, user_logged)
            # Create a profile for the new user and show the Home page to that user
            # profile = UserProfile.objects.create(user = user, userID = user.id)
            profile = UserProfile.objects.create(user = user)
            profile.save()
            registered = True
            #redirect the new user to the profile page so that they can add the missing info in their profile
            return redirect('/profile')
        else:
            print(user_form.errors)
    else:
        user_form = UserForm()

    return render(request, 'awesome_social_network_app/register.html',{ 'user_form': user_form, 
                                                                        'registered': registered })

def user_login(request):
    '''Function to login an user into the system'''
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user) 
                return HttpResponseRedirect('../') 
            else:
                return HttpResponse("Your account is disabled.")
        else:
            logger.warning('Invalid login: ' + username)
            messages.info(request, 'Invalid credentials supplied')
            return redirect('/login')
    else:
        return render(request, 'awesome_social_network_app/login.html', {})

@login_required
def user_logout(request):
    logout(request)
    logger.info("User has logged out")
    return HttpResponseRedirect('/login') 

@login_required
def profile(request):
    '''Show the logged in user their basic info and offer the ability to edit it'''
    user_profile = UserProfile.objects.get(user=request.user)
    user = request.user  
    if request.method == 'POST':
        profile_form = UserProfileForm(request.POST,request.FILES, instance = user_profile)
        user_basic_form = UserNamesForm(request.POST,request.FILES, instance = user)  
        image = user_profile.userImg
        if profile_form.is_valid():
            profile = profile_form.save(commit=False)
            if request.FILES.get('userImg') != None:
                image = profile_form.cleaned_data.get('userImg')
            profile.userImg = image
            profile.save() 
        else:
            print(profile_form.errors)

        if user_basic_form.is_valid(): 
            # to update the first_name and last_name fields of the logged in user
            user2 = user_basic_form.save() 
            user2.save() 
        messages.info(request, 'Your profile was updated')
    else:
        profile_form = UserProfileForm(initial=model_to_dict(user_profile))
        user_basic_form = UserNamesForm(initial=model_to_dict(user)) 

    return render(request, 'awesome_social_network_app/user_info.html',{'user_profile' : user_profile, 
                                                                        'profile_form': profile_form, 
                                                                        'user_basic_form': user_basic_form})

@login_required
def post(request):
    '''
    This function will create a new PostUpdate object if the user writes a Status update or uploads
    a picture in their home page. The object will be created if at least one of the two entries is 
    not provided, and the status in that case can not be an empty string.
    '''
    user = request.user 
    if request.method == 'POST':
        status_message = request.POST['status'].replace(" ","")
        if request.FILES.get('postImg') != None or status_message != '' :
            post_form = PostUpdateForm(request.POST,request.FILES)
            image = None
            if post_form.is_valid():
                post = post_form.save(commit = False)
                post.user = user
                if request.FILES.get('postImg') != None:
                    image = post_form.cleaned_data.get('postImg')
                post.postImg = image
                post.save()
            else:
                print(post_form.errors)
    return redirect('/')

@login_required
def like(request):
    '''Function to increase or decrease the like count on a post object'''
    # username = request.user.username
    user = request.user 
    post_id = request.GET.get('post_id')
    post_obj = PostUpdate.objects.get(id=post_id)
    # check if the post was already liked by this user
    # liked_post = PostLiked.objects.filter(post_id = post_id, username = username).first()
    liked_post = PostLiked.objects.filter(post = post_obj, user = user).first()
    if liked_post == None :
        #here the user has not yet liked this post
        # postLiked_obj = PostLiked.objects.create(post_id = post_id, username = username )
        postLiked_obj = PostLiked.objects.create(post = post_obj, user = user )
        postLiked_obj.save()  #save it in the database!
        post_obj.likeCount += 1  #increase the number of likes for that post
        post_obj.save()  #update the database

    else:
        #here the user has already liked this post, so we must unlike it
        #by deleting the obj from the PostLiked table
        liked_post.delete()
        post_obj.likeCount -= 1  #decrease the number of likes for that post
        post_obj.save()
    return redirect('/')

@login_required
def user_profile(request, username):
    '''Shows the Home page of an user defined by "username" to the currently logged in user'''
    user1 = User.objects.get(username = request.user.username)  
    profile1 = UserProfile.objects.get( user = request.user ) 
    user2 = User.objects.get(username = username) 
    profile2 = UserProfile.objects.get(user= user2) 
    # user2_posts = PostUpdate.objects.filter(user = username)
    user2_posts = PostUpdate.objects.filter(user = user2)
    nr_of_post = len(user2_posts)
    following = False
    # follow_obj = Following.objects.filter(followerUsername = user1.username, followedUsername = username ).first()
    follow_obj = Following.objects.filter(followerUser = user1, followedUser = user2 ).first()
    if follow_obj:
        following = True
    chatroom_name = getChatRoomName(user1.username, user2.username)
    # followed_user_profiles = getFriendList(username)
    followed_user_profiles = getFriendList(user2)
    # follower_count = len(Following.objects.filter(followedUsername = username)) #How many people are following this user
    follower_count = len(Following.objects.filter(followedUser = user2)) #How many people are following this user
    following_count = len(followed_user_profiles) #How many people is this user following
    return render(request,'awesome_social_network_app/user_profile.html', {'user': user1,
                                                                            'user2' : user2,
                                                                            'user_profile' : profile1,
                                                                            'current_profile' : profile2,
                                                                            'posts' : user2_posts,
                                                                            'nr_of_post' : nr_of_post,
                                                                            'following': following,
                                                                            'follower_count' : follower_count,
                                                                            'following_count' : following_count,
                                                                            'chatroom_name' : chatroom_name,
                                                                            'friend_profiles' : followed_user_profiles,
                                                                            })

@login_required
def follow(request):
    '''Make an user follow/unfollow another user by creating or deleting a Following object. '''
    if request.method == 'POST':
        followed = request.POST['followed']
        followed_user = User.objects.get(username = followed)
        # user = request.user.username
        # following = Following.objects.filter(followerUsername = user, followedUsername = followed ).first()
        following = Following.objects.filter(followerUser = request.user, followedUser = followed_user ).first()
        # need to check if the logged in user is already following this second user or not
        if following:
            #if already following, then unfollow
            # following_obj = Following.objects.get(followerUsername = user, followedUsername = followed )
            following_obj = Following.objects.get(followerUser = request.user, followedUser = followed_user )
            following_obj.delete()
        else:
            #if not following, create a Following object and save it in the database
            # new_following = Following.objects.create(followerUsername = user, followedUsername = followed )
            new_following = Following.objects.create(followerUser = request.user, followedUser = followed_user  )
            new_following.save()
        return redirect('/user_profile/' +  followed )
    else:
        return redirect('/')

@login_required
def search_username(request):
    logged_user = User.objects.get(username = request.user.username)
    logged_user_profile = UserProfile.objects.get( user = request.user )
    if request.method == 'POST':
        username = request.POST['username']
        # look for all the users where their usernames contain the string sent in the request
        # this is not a exact match, is quite simplistic. 
        users_search_results = User.objects.filter(username__icontains = username)
        # Get the list of the profiles for the users in the resulting search
        profile_list = []
        for user_obj in users_search_results:
            # profile_obj = UserProfile.objects.filter(userID = user_obj.id)
            profile_obj = UserProfile.objects.filter(user = user_obj)
            profile_list.append(profile_obj)
        profile_list = list(chain(*profile_list))
    return render(request, 'awesome_social_network_app/search_user.html', { 'user' : logged_user,
                                                                            'user_profile' : logged_user_profile,
                                                                            'profile_list' : profile_list,
                                                                            'query' : username
                                                                          })