#!/usr/bin/env python3
"""
Test script to verify Redis connection
"""
import os
import sys
import redis
from decouple import config

def test_redis_connection():
    """Test Redis connection"""
    try:
        # Get Redis URL from environment
        redis_url = config('REDIS_URL', default='redis://localhost:6379/0')
        
        print("🔍 Testing Redis Connection...")
        print(f"Redis URL: {redis_url}")
        
        # Parse Redis URL
        if redis_url.startswith('redis://'):
            # Remove redis:// prefix and get host:port
            connection_string = redis_url.replace('redis://', '')
            if '/' in connection_string:
                host_port, db = connection_string.split('/')
            else:
                host_port = connection_string
                db = '0'
            
            # Handle authentication in host_port
            if '@' in host_port:
                auth, host_port = host_port.split('@')
                if ':' in auth:
                    username, password = auth.split(':')
                else:
                    username = auth
                    password = None
            else:
                username = None
                password = None
            
            if ':' in host_port:
                host, port = host_port.split(':')
            else:
                host = host_port
                port = 6379
            
            print(f"Host: {host}")
            print(f"Port: {port}")
            print(f"Database: {db}")
            if username:
                print(f"Username: {username}")
        
        # Connect to Redis
        r = redis.from_url(redis_url)
        
        # Test basic operations
        print("\n📡 Testing Redis operations...")
        
        # Test SET/GET
        r.set('test_key', 'Hello Redis!')
        value = r.get('test_key')
        print(f"✅ SET/GET test: {value.decode()}")
        
        # Test PING
        ping_response = r.ping()
        print(f"✅ PING test: {ping_response}")
        
        # Test INFO
        info = r.info()
        print(f"✅ INFO test: Redis version {info.get('redis_version', 'unknown')}")
        
        # Test Celery queue
        r.lpush('celery', 'test_task')
        queue_length = r.llen('celery')
        print(f"✅ Celery queue test: {queue_length} tasks in queue")
        
        # Cleanup
        r.delete('test_key')
        r.lpop('celery')
        
        print("\n🎉 Redis connection test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Redis connection test FAILED!")
        print(f"Error: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your REDIS_URL in .env file")
        print("2. Verify the Redis cluster is 'Available' in AWS")
        print("3. Check security group allows connections on port 6379")
        print("4. Ensure your IP is allowed in the security group")
        return False

def test_environment():
    """Test environment variables"""
    print("🔧 Testing Environment Variables...")
    
    redis_url = config('REDIS_URL', default=None)
    if redis_url:
        print(f"✅ REDIS_URL: {redis_url[:50]}..." if len(redis_url) > 50 else f"✅ REDIS_URL: {redis_url}")
    else:
        print("❌ REDIS_URL: MISSING")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 RedditLead.AI - Redis Connection Test")
    print("=" * 50)
    
    # Test environment first
    env_ok = test_environment()
    
    if env_ok:
        # Test Redis connection
        redis_ok = test_redis_connection()
        
        if redis_ok:
            print("\n🎉 All tests PASSED! Your Redis is ready for Celery tasks.")
            sys.exit(0)
        else:
            print("\n❌ Redis connection test failed.")
            sys.exit(1)
    else:
        print("\n❌ Environment setup failed.")
        sys.exit(1) 