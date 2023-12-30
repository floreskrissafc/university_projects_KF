from itertools import chain
from .models import *
import random

'''Custom functions that are used in api.py or views.py '''

def getFriendList(user):
    '''
    Function that returns a list of UserProfile objects. These objects are
    for the users that are being followed by the user given as parameter
    '''
    users_followed = []
    followed_objs = Following.objects.filter(followerUser = user)
    for followed_obj in followed_objs:
        followed_user = User.objects.get(username = followed_obj.followedUser.username)
        users_followed.append(followed_user)
    
    followed_user_profiles = []
    for user_followed in users_followed:
        followed_profile = UserProfile.objects.filter( user = user_followed)   #changed line
        followed_user_profiles.append(followed_profile)
    followed_user_profiles = list(chain(*followed_user_profiles))
    return followed_user_profiles

def getChatRoomName(username1, username2):
    '''Return the unique ChatRoom name for these two users'''
    chatroom_name = ""
    if username1 > username2:
        chatroom_name = "" + username1 + "__" + username2
    else:
        chatroom_name = "" + username2 + "__" + username1
    return chatroom_name

def getFollowedUsersList(user):
    '''Return a list of the users  being followed
    by the current logged in user '''
    followed_users = []
    follow_objs = Following.objects.filter(followerUser= user)
    for following_obj in follow_objs:
        followed_user = User.objects.get(username = following_obj.followedUser.username)
        followed_users.append(followed_user)
    return followed_users

def getPostFeed(followed_users):
    post_list = []
    for user in followed_users:
        followed_user_post_list = PostUpdate.objects.filter(user = user)
        post_list.append(followed_user_post_list)
    post_list = list(chain(*post_list))
    return post_list

def getSuggestedFriendsProfiles(followed_users, user):
    all_users = User.objects.all() 
    usernames_of_followed_users = []
    for user in followed_users:
        usernames_of_followed_users.append(user.username)
    usernames_of_followed_users_set = set(usernames_of_followed_users)
    # to not show admin as a suggested friend
    usernames_of_followed_users_set.add("admin") 
    users_not_being_followed = []
    for new_user in all_users:
        if new_user != user and new_user.username not in usernames_of_followed_users_set:
            users_not_being_followed.append(new_user)
    #Get a randomly ordered list of new friend suggestions
    random.shuffle(users_not_being_followed) 
    # Select only five of those random user suggestions, 
    # in case there are many registered users and the list becomes too long
    users_not_being_followed = users_not_being_followed[:6] 
    # Get the list of the profile for each of these new user suggestions
    suggested_user_profiles = []
    for new_user in users_not_being_followed:
        profile = UserProfile.objects.filter( user = new_user ) #new line
        suggested_user_profiles.append(profile)
    suggested_user_profiles = list(chain(*suggested_user_profiles))
    return suggested_user_profiles

