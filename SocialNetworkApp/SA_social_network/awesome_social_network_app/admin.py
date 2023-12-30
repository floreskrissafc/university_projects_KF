from django.contrib import admin
from .models import *

# Register your models here.
# this is to be able to see all the models in the admin page
admin.site.register(UserProfile) 
admin.site.register(PostUpdate)
admin.site.register(PostLiked)
admin.site.register(Following)
admin.site.register(Chat)
admin.site.register(ChatRoom)
