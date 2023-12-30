
'''
This file is for creating instances of every model in models.py. 
These instances are going to be used in my tests so that I do not have to
create each instance by hand for every test I make. I can create instances
of my models with default data that I provide here.

There are five classes I want to test in the models.py file, I must create a 
factory for each one of these: User, UserProfile, PostUpdate, PostLiked and Following
so that I can create instances of them with default data.
'''
import factory
import factory.fuzzy
from .models import *
from factory.faker import Faker
import datetime

class UserFactory(factory.django.DjangoModelFactory):
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    username = factory.Faker('first_name')
    email = factory.Faker('email')
    password = '1234'
    class Meta:
        model = User

class UserProfileFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    userImg = factory.django.ImageField(color='blue')
    bio = factory.Faker('sentence', nb_words=4)
    class Meta:
        model = UserProfile

class PostUpdateFactory(factory.django.DjangoModelFactory):
    id = Faker('uuid4')
    user = factory.SubFactory(UserFactory)
    postImg = factory.django.ImageField(color='blue')
    creationDate = factory.fuzzy.FuzzyDateTime(start_dt = datetime.datetime.now(datetime.timezone.utc))
    status = factory.Faker('sentence', nb_words=5)
    likeCount = 0
    class Meta:
        model = PostUpdate

class PostLikedFactory(factory.django.DjangoModelFactory):
    post = factory.SubFactory(PostUpdateFactory)
    user = factory.SubFactory(UserFactory)
    class Meta:
        model = PostLiked

class FollowingFactory(factory.django.DjangoModelFactory):
    followerUser = factory.SubFactory(UserFactory)
    followedUser = factory.SubFactory(UserFactory)
    class Meta:
        model = Following



