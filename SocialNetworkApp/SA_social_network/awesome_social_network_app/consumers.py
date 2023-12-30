import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, ChatRoom

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # To join the room group
        self.room_name = self.scope['url_route']['kwargs']['room_name']  #here we get the room name
        self.room_group_name = 'chat_%s' % self.room_name  #create the group name for the room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # To leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # To receive messages from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.user_id = self.scope['user'].id
        # Find the room for the two users
        room = await database_sync_to_async(ChatRoom.objects.get)(name = self.room_name)
        # Create a new chat object
        chat = Chat( 
            content = message, 
            user = self.scope['user'],
            room = room
        )
        # Save the new chat in the database
        await database_sync_to_async(chat.save)()
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user_id': self.user_id
            }
        )

    # To receive message from the room group
    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']
        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user_id': user_id
        }))