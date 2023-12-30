from rest_framework import permissions
from .models import *
'''Custom permissions used in api.py '''

class IsOwnerOfPost(permissions.BasePermission):
    message = "You do not have permission to perform this action because you are not the owner of this post."
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsOwnerOfObject(permissions.BasePermission):
    message = "You do not have permission to perform this action because you are not the owner of this account"
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user