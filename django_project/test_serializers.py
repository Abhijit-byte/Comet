#!/usr/bin/env python
"""Test community API serializers"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cosmic_watch.settings')
django.setup()

from community.models import ForumPost
from community.serializers import ForumPostListSerializer, ForumPostSerializer
from django.contrib.auth.models import User
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()

# Get the test user and post
user = User.objects.get(username='testuser')
post = ForumPost.objects.first()

if post:
    print(f"Found post: {post.title}")
    
    # Test list serializer
    try:
        request = factory.get('/api/community/posts/')
        request.user = user
        
        from django.db.models import Count, Sum
        from django.db.models.functions import Coalesce
        
        queryset = ForumPost.objects.annotate(
            score=Coalesce(Sum('forum_votes__value'), 0),
            comment_count=Count('forum_comments')
        )
        
        post_with_annotations = queryset.first()
        
        serializer = ForumPostListSerializer(post_with_annotations, context={'request': request})
        print("List serializer data:")
        print(serializer.data)
    except Exception as e:
        print(f"List serializer error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Test detail serializer
    try:
        serializer = ForumPostSerializer(post_with_annotations, context={'request': request})
        print("\nDetail serializer data:")
        print(serializer.data)
    except Exception as e:
        print(f"Detail serializer error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
else:
    print("No posts found")
