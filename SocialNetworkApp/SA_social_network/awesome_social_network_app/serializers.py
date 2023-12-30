from rest_framework import serializers
from .models import *

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'first_name', 'last_name']

class UserSerializer(serializers.Serializer):
    # Unfortunately, I can't use serializer.ModelSerializer described
    # in the commented lines before this class. This is because 
    # I want to allow the API to reuse existing Users when
    # updating a UserProfile with a PUT request. The REST framework
    # apparently does not allow disabling the uniqueness constraint on 
    # nested serializers according to:
    # https://www.django-rest-framework.org/api-guide/validators/#updating-nested-serializers
    # So I need to define every attribute in the serializer myself.
    id = serializers.IntegerField(read_only=True)
    # username = serializers.CharField(required=True, max_length = 150, allow_blank=False)
    username = serializers.CharField(max_length = 150, read_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True,max_length = 150)
    last_name = serializers.CharField(required=False, allow_blank=True,max_length = 150)

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    userImg = serializers.ImageField(required=False, max_length = None, use_url = False)
    
    class Meta:
        model = UserProfile
        fields = ['id','user', 'userImg', 'bio']
    
    def update(self, instance, validated_data):
        # to be able to update the User object from the API for the UserProfile
        # based on https://www.django-rest-framework.org/api-guide/serializers/#writable-nested-representations
        user = instance.user
        try:
            user_data = validated_data.pop('user')
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
        except:
            user.save()
        instance.userImg = validated_data.get('userImg', instance.userImg)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.save()
        user.save()
        return instance

class PostUpdateSerializer(serializers.ModelSerializer):
    postImg = serializers.ImageField(required=False, max_length = None, use_url = False)
    creationDate = serializers.DateTimeField(required=False)
    class Meta:
        model = PostUpdate
        read_only_fields = ('likeCount','user','id') #to not allow a user to modify the likes on its own posts
        fields = ['id','postImg', 'creationDate', 'status', 'likeCount']
        
