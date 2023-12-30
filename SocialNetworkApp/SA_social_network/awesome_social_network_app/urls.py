from django.urls import include, path
from . import views
from . import api
from rest_framework import routers

urlpatterns = [
    path('', views.index, name = 'index'),
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('profile/', views.profile, name='profile_settings'),
    path('post/', views.post , name='post'),
    path('like_post/', views.like , name = 'like_post'),
    path('user_profile/<str:username>', views.user_profile, name='user_profile'),
    path('follow/', views.follow, name='follow'),
    path('search_username/', views.search_username, name='search'),
    path('message/<str:room_name>/', views.message, name='message'),
    path('api/users', api.Users.as_view(), name='users_api'),
    path('api/user/<int:pk>', api.user_info, name='user_api'),
    path('api/edit_user/<int:pk>', api.UserDetail.as_view(), name='edit_user_api'),
    path('api/posts', api.PostList.as_view(), name="post_list_api"),
    path('api/post/<str:pk>', api.PostDetail.as_view(), name="post_detail_api"),
    path('api/friends', api.FriendsList.as_view(), name='friends_list' )
]
