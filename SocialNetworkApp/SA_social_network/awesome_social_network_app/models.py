from django.db import models
from django.contrib.auth.models import User
import uuid
from datetime import datetime

# Django by default has a User model that provides email, first_name, last_name, password, username
User._meta.get_field('email')._unique = True
User._meta.get_field('email').blank = False
User._meta.get_field('email').null = False

class UserProfile(models.Model):
    '''Model to save extra information for an user.'''
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    userImg = models.ImageField(upload_to='profile_imgs', default = 'default_profile_img.png')
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.username

class PostUpdate(models.Model):
    '''Model to save the posts an user creates. A post can have text, picture, or both.
    This model also saves a counter of the number of likes the post has received.'''
    id = models.UUIDField(primary_key = True, default = uuid.uuid4)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    postImg = models.ImageField(upload_to = 'post_imgs', blank = True, null = True)
    creationDate = models.DateTimeField(default = datetime.now)
    status = models.CharField(max_length = 500, default = "" , blank = True, null = True)
    likeCount = models.IntegerField(default = 0)

    def __str__(self):
        return self.user.username 

class PostLiked(models.Model):
    '''Model to save which posts have been liked and by whom'''
    post = models.ForeignKey(PostUpdate, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    def __str__(self):
        return self.user.username

class Following(models.Model):
    '''Model to save friends relationships. One person is the follower
    and other person is the followed user.'''
    followerUser = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'follower')
    followedUser = models.ForeignKey(User, on_delete = models.CASCADE,related_name = 'followed')
    def __str__(self):
        return self.followerUser.username + " follows " + self.followedUser.username

class Chat(models.Model):
    '''Model to save messages that one user sends. Each user
    can send messages through ChatRooms, but all are saved here.'''
    content = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    room = models.ForeignKey('ChatRoom', on_delete = models.CASCADE)
    def __str__(self):
        return self.room.name

class ChatRoom(models.Model):
    '''Model to save the names of the chatrooms through which users can send
    messages to each other. The only field is a the name of the ChatRoom, which
    will be created by merging the usernames of the two users that use a specific
    ChatRoom. The usernames are unique by default, there will be only one chatRoom that
    associates two users.'''
    name = models.CharField(max_length = 300)
    def __str__(self):
        return self.name
    

