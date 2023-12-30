import json
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APITestCase
from .model_factories import *
from .models import *
from .serializers import *
from rest_framework.test import APIClient 
from datetime import datetime
import io
from PIL import Image
from factory.faker import Faker

class FinalProjectAPITestCase(APITestCase):
    def setUp(self):
        # Before proceding with any test
        # delete the contents of all the tables
        # in the test DB and reset the sequences
        # for the model_factories that employ sequences
        User.objects.all().delete()
        UserProfile.objects.all().delete()
        PostUpdate.objects.all().delete()
        PostLiked.objects.all().delete()
        Following.objects.all().delete()
        PostUpdateFactory.reset_sequence(0)
        PostLikedFactory.reset_sequence(0)
        #Create several users and their profiles
        self.user1 = UserFactory.create(username = "username1")
        self.profile1 = UserProfileFactory.create(user = self.user1)
        self.user2 = UserFactory.create(username = "username2")
        self.profile2 = UserProfileFactory.create(user = self.user2)
        self.user3 = UserFactory.create(username = "username3")
        self.profile3 = UserProfileFactory.create(user = self.user3)
        self.client = APIClient()
    
    def generate_photo_file(self):
        '''Function to create an image to test creating posts and updating a profile'''
        file = io.BytesIO()
        image = Image.new('RGBA', size=(100, 100), color=(155, 0, 0))
        image.save(file, 'png')
        file.name = 'image_generated_by_code.png'
        file.seek(0)
        return file

class Users_Tests(FinalProjectAPITestCase):
    '''
    Testing GET requests to endpoint: api/users
    '''
    def test_get_users_success(self):
        '''Test that an authenticated user gets a 200 response'''
        # self.client.login(username=user1.username, password='1234') # this login line did not work 
        self.client.force_authenticate(self.user1) # I have to force authenticate to be able to make requests to my API
        url = reverse('users_api')
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 200)
        self.client.logout()
        
    def test_get_users_fails(self):
        '''Test that non authenticated users get a 403 response'''
        url = reverse('users_api')
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 403)

    def test_get_users_returns_correct_response(self):
        '''Test that an authenticated user gets a correct response from the endpoint'''
        self.client.force_authenticate(user = self.user1) 
        url = reverse('users_api')
        response = self.client.get(url, format='json')
        response.render()
        data = json.loads(response.content)
        
        # test that the response only shows 3 users
        self.assertEqual(len(data), 3)

        # test that the response includes all the correct fields
        users=[{'id': self.profile1.id, 
                'user' : {  'id' : self.user1.id, 
                            'username' : self.user1.username, 
                            'first_name': self.user1.first_name, 
                            'last_name': self.user1.last_name },
                'bio' : self.profile1.bio,
                'userImg' : self.profile1.userImg},
               {'id': self.profile2.id, 
                'user' : {  'id' : self.user2.id, 
                            'username' : self.user2.username, 
                            'first_name': self.user2.first_name, 
                            'last_name': self.user2.last_name },
                'bio' : self.profile2.bio,
                'userImg' : self.profile2.userImg},
               {'id': self.profile3.id, 
                'user' : {  'id' : self.user3.id, 
                            'username' : self.user3.username, 
                            'first_name': self.user3.first_name, 
                            'last_name': self.user3.last_name },
                'bio' : self.profile3.bio,
                'userImg' : self.profile3.userImg }]
        self.assertListEqual(users, data)
        self.client.logout()

class User_Tests(FinalProjectAPITestCase):
    '''
    Testing GET requests to endpoint: api/user/<int:pk>
    '''
    def test_get_user_success(self):
        '''Test that an authenticated user gets a 200 response if
        the pk was valid'''
        self.client.force_login(user = self.user1) 
        url = reverse('user_api', kwargs={'pk': self.user1.id } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 200)

    def test_get_user_fails_302(self):
        '''Test that an user gets a 302 response
        when the user is not authenticated. This is
        because the page redirects them to the login page.'''
        url = reverse('user_api', kwargs={'pk': 6 } )
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 302)
    
    def test_get_user_fails_404(self):
        '''Test that an authenticated user gets a 404 response
        when the pk is not for a valid User object'''
        self.client.force_login(user = self.user1) 
        url = reverse('user_api', kwargs={'pk': 6 } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 404)

    def test_get_user_returns_correct_response(self):
        '''Test that an authenticated user gets a 
        correct response from the endpoint'''
        self.client.force_login(user = self.user1) 
        url = reverse('user_api', kwargs={'pk': self.user1.id } )
        response = self.client.get(url, format='json')
        response.render()
        data = json.loads(response.content)
        correct_resp = {'id': self.profile1.id, 
                        'user' : {  'id' : self.user1.id, 
                                    'username' : self.user1.username, 
                                    'first_name': self.user1.first_name, 
                                    'last_name': self.user1.last_name },
                        'bio' : self.profile1.bio,
                        'userImg' : self.profile1.userImg}
        self.assertEqual(correct_resp, data)

    
class Friends_Tests(FinalProjectAPITestCase):
    '''
    Testing GET requests to endpoint: api/friends
    '''
    def test_get_friends_success(self):
        '''Test that an authenticated user gets a 200 response'''
        self.client.force_authenticate(self.user1) 
        url = reverse('friends_list')
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 200)
        self.client.logout()

    def test_get_friends_fails(self):
        '''Test that non authenticated users get a 403 response'''
        url = reverse('friends_list')
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 403)

    def test_get_friends_returns_correct_response(self):
        '''Test that an authenticated user gets a correct 
        response from the endpoint'''
        self.client.force_authenticate(self.user1)
        # Create 2 new users with their profiles
        user4 = UserFactory.create(username = "username4")
        profile4 = UserProfileFactory.create(user = user4)
        user5 = UserFactory.create(username = "username5")
        profile5 = UserProfileFactory.create(user = user5)
        # Make self.user1 follow these new users
        follow1 = FollowingFactory( followerUser = self.user1,
                                    followedUser = user4)
        follow2 = FollowingFactory( followerUser = self.user1,
                                    followedUser = user5)
        url = reverse('friends_list')
        response = self.client.get(url, format='json')
        response.render()
        data = json.loads(response.content)
        # Check that the response only contains two objects, one for each friend
        self.assertEqual(len(data), 2)

        #Check that the friends listed are user4 and user5 and not others
        friends =[{ 'id': profile4.id, 
                    'user' : {  'id' : user4.id, 
                                'username' : user4.username, 
                                'first_name': user4.first_name, 
                                'last_name': user4.last_name },
                    'bio' : profile4.bio,
                    'userImg' : profile4.userImg},
                    {'id': profile5.id, 
                    'user' : {  'id' : user5.id, 
                                'username' : user5.username, 
                                'first_name': user5.first_name, 
                                'last_name': user5.last_name },
                    'bio' : profile5.bio,
                    'userImg' : profile5.userImg}]
        self.assertListEqual(friends, data)
        self.client.logout()

class Posts_Tests(FinalProjectAPITestCase):
    '''
    Testing GET and POST requests to endpoint: api/posts
    '''
    def test_get_posts_success(self):
        '''Test that an authenticated user gets a 200 response'''
        self.client.force_authenticate(self.user1) 
        url = reverse('post_list_api')
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 200)
        self.client.logout()
    
    def test_get_posts_fails(self):
        '''Test that non authenticated users get a 403 response'''
        url = reverse('post_list_api')
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 403)
    
    def test_get_posts_returns_correct_response(self):
        '''Test that an authenticated user gets a correct response from the endpoint'''
        self.client.force_authenticate(self.user1)
        # Create 2 posts for the authenticated user
        post1 = PostUpdateFactory(user = self.user1, creationDate = datetime.now())
        post2 = PostUpdateFactory (user = self.user1, creationDate = datetime.now())
        # Create 2 post for other user
        post3 = PostUpdateFactory(user = self.user2)
        post4 = PostUpdateFactory (user = self.user3)
        
        # Check that in fact both posts have different ids
        self.assertNotEqual(post1.id, post2.id)
        
        url = reverse('post_list_api')
        response = self.client.get(url, format='json')
        response.render()
        data = json.loads(response.content)
        # Check that the returned lists has only two elements
        self.assertEqual(len(data), 2)

        # Check that the returned elements the ones we expect
        posts= [{  
                'id': post1.id,
                'postImg' : post1.postImg.name,
                'creationDate' : post1.creationDate.isoformat()+'Z',
                'status': post1.status,
                'likeCount' : post1.likeCount },
                {  
                'id': post2.id,
                'postImg' : post2.postImg.name,
                'creationDate' : post2.creationDate.isoformat()+'Z',
                'status': post2.status,
                'likeCount' : post2.likeCount}]
        self.assertListEqual(posts, data)
        self.client.logout()   
    
    def test_post_a_posts_saves_new_post_no_image(self):
        '''Test that an authenticated user can create a new post, without an image'''
        self.client.force_authenticate(self.user2)
        url = reverse('post_list_api')
        post = {  
                'status': "my new status"
                }
        response = self.client.post(url, post, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client.logout()
    
    def test_post_a_posts_saves_new_post_no_status(self):
        '''Test that an authenticated user can create a new post, without a status'''
        # based on https://gist.github.com/guillaumepiot/817a70706587da3bd862835c59ef584e
        self.client.force_authenticate(self.user3)
        url = reverse('post_list_api')
        photo_file = self.generate_photo_file()
        post = {  
                'postImg' : photo_file,
                }
        response = self.client.post(url, post, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client.logout()

    def test_post_a_posts_saves_new_post_with_status_and_image(self):
        '''Test that an authenticated user can create a new post with status and image'''
        # based on https://gist.github.com/guillaumepiot/817a70706587da3bd862835c59ef584e
        self.client.force_authenticate(self.user3)
        url = reverse('post_list_api')
        photo_file = self.generate_photo_file()
        post = {  
                'user' : self.user3,
                'status': "new status here",
                'postImg' : photo_file,
                }
        response = self.client.post(url, post, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client.logout()

class Post_Tests(FinalProjectAPITestCase):
    '''
    Testing GET, PUT, DELETE requests to endpoint: api/post/<str:pk>
    '''
    def test_get_post_success(self):
        '''Test that an authenticated user gets a 200 response'''
        self.client.force_authenticate(self.user1)
        # Create a post for the authenticated user
        post1 = PostUpdateFactory(user = self.user1, creationDate = datetime.now())
        url = reverse('post_detail_api', kwargs={'pk': post1.id } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 200)
        self.client.logout()
    
    def test_get_post_fails_404(self):
        '''Test that an authenticated user gets a 404 response if the post doesn't exist'''
        self.client.force_authenticate(self.user1)
        url = reverse('post_detail_api', kwargs={'pk': "arandomkey12345" } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 404)
        self.client.logout()
    
    def test_get_post_fails_403(self):
        '''Test that non authenticated users get a 403 response'''
        url = reverse('post_detail_api', kwargs={'pk': "arandomkey12345" } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 403)
    
    def test_delete_post_success_204(self):
        '''Test that an authenticated user gets a 204 response when deleting an existing post'''
        self.client.force_authenticate(self.user1)
        # Create a post for the authenticated user
        post1 = PostUpdateFactory(user = self.user1, creationDate = datetime.now())
        url = reverse('post_detail_api', kwargs={'pk': post1.id } )
        response = self.client.delete(url)
        response.render()
        self.assertEqual(response.status_code, 204)
        self.client.logout()
    
    def test_delete_post_fails_403(self):
        '''Test that an authenticated users can not delete posts that don't belong to them'''
        self.client.force_authenticate(self.user1)
        # Create a post for the non authenticated user
        post1 = PostUpdateFactory(user = self.user2, creationDate = datetime.now())
        url = reverse('post_detail_api', kwargs={'pk': post1.id } )
        response = self.client.delete(url)
        response.render()
        self.assertEqual(response.status_code, 403)
        self.client.logout()

    def test_put_post_success_200(self):
        '''Test that an authenticated user gets a 200 response when editing a post they own'''
        self.client.force_authenticate(self.user1)
        # Create a post for the authenticated user
        post1 = PostUpdateFactory(user = self.user1, creationDate = datetime.now())
        status = post1.status
        postImg = post1.postImg
        photo_file = self.generate_photo_file()
        # the only required field is "user"
        modified_post = {   'user' : post1.user,
                            'status': "modified status",
                            'postImg': photo_file } 
        url = reverse('post_detail_api', kwargs={'pk': post1.id } )
        response = self.client.put(url, data = modified_post)
        response.render()
        self.assertEqual(response.status_code, 200)
        # Check that in fact the data for this object was changed
        post1.refresh_from_db()     # must refresh the object from the database
        self.assertNotEqual(status, post1.status)
        self.assertNotEqual(postImg, post1.postImg)
        self.client.logout()

class EditUser_Tests(FinalProjectAPITestCase):
    '''
    Testing GET, PUT requests to endpoint: api/edit_user/<int:pk>
    '''
    def test_get_profile_success(self):
        '''Test that an authenticated user gets a 200 response, if owner of the profile'''
        self.client.force_authenticate(self.user1)
        url = reverse('edit_user_api', kwargs={'pk': self.profile1.id } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 200)
        self.client.logout()

    def test_get_profile_fail_403(self):
        '''Test that an authenticated user gets a 403 response, if is not the owner of the profile'''
        self.client.force_authenticate(self.user1)
        url = reverse('edit_user_api', kwargs={'pk': self.profile2.id } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 403)
        self.client.logout()
        
    def test_put_profile_success(self):
        '''Test that an authenticated user gets a 200 response when updating their profile'''
        self.client.force_authenticate(self.user1)
        url = reverse('edit_user_api', kwargs={'pk': self.profile1.id } )
        modified_profile = { 'user' : {'first_name' : "updatedName"},
                            'bio': "modified bio" } 
        response = self.client.put(url, data = modified_profile, format='json')
        self.assertEqual(response.status_code, 200)
        self.profile1.refresh_from_db()
        self.user1.refresh_from_db()
        self.assertEqual(self.profile1.bio, "modified bio")
        self.assertEqual(self.user1.first_name, "updatedName")

    def test_get_profile_fail_404(self):
        '''Test that an authenticated user gets a 404 response, if the profile doesn't exist'''
        self.client.force_authenticate(self.user1)
        url = reverse('edit_user_api', kwargs={'pk': 100 } )
        response = self.client.get(url, format='json')
        response.render()
        self.assertEqual(response.status_code, 404)
        self.client.logout()
    
    



    












