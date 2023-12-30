from django import forms
from django.forms import ModelForm
from .models import *
from django.contrib.auth.models import User

class UserForm(forms.ModelForm):
    ''' Form for the default User Model'''
    password = forms.CharField(widget=forms.PasswordInput())

    class Meta:
        model = User
        fields = ('first_name','last_name','username', 'email', 'password')

class UserProfileForm(forms.ModelForm):
    ''' Form for the UserProfile Model'''
    class Meta:
        model = UserProfile
        fields = ('userImg', 'bio')

class UserNamesForm(forms.ModelForm):
    '''Form to update first_name and last_name fields of an user'''
    class Meta:
        model = User
        fields = ('first_name', 'last_name')

class PostUpdateForm(forms.ModelForm):
    '''Form to create a new post object'''
    class Meta:
        model = PostUpdate
        fields = ('status', 'postImg')

        