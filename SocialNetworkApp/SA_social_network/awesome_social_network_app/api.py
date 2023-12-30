from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView
from rest_framework.generics import ListAPIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework import mixins
from rest_framework.permissions import  IsAuthenticated
from .custom_permissions import *
from .custom_functions import getFriendList
from django.http import Http404
from django.core.exceptions import PermissionDenied
from rest_framework.exceptions import ValidationError

class FriendsList(ListAPIView):
    """
    API endpoint that allows to see a list of all the users
    that are being followed by the logged in user.
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        friends_list = getFriendList(self.request.user)
        return friends_list


class PostList(ListCreateAPIView):
    """
    API endpoint that allows to see a list of all the posts
    created by the logged in user.
    """
    queryset = PostUpdate.objects.all()
    serializer_class = PostUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return PostUpdate.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        return serializer.save(user = user)

class PostDetail(RetrieveUpdateDestroyAPIView):
    """
    API endpoint that allows to see the details of a post, update those
    details, and delete the post completely. The logged in user should be
    the owner of the post to be able to do these actions.
    """
    queryset = PostUpdate.objects.all()
    serializer_class = PostUpdateSerializer
    permission_classes = [IsOwnerOfPost, IsAuthenticated]


class UserDetail(RetrieveUpdateAPIView):
    """
    API endpoint that allows to see and update the profile settings of 
    an user if the current logged in user is the owner of that account.
    The pk parameter is the "id" of the UserProfile object, not the User object.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsOwnerOfObject, IsAuthenticated]


class Users(ListAPIView):
    """
    API endpoint that allows to see a list of all registered users
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]


@login_required(login_url='login')
@api_view(['GET'])
def user_info(request, pk):
    """
    API endpoint that allows to see specific user details.
    the pk parameter is the "id" of the User object, not the UserProfile object.
    Can be seen by any logged in user. 
    """
    try:
        user = User.objects.get(pk = pk)
        user_details = UserProfile.objects.get(user = user)
    except User.DoesNotExist:
        raise Http404
    if request.method == 'GET':
        serializer = UserProfileSerializer(user_details)
        return Response(serializer.data)







    




        




