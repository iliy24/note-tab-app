from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Tab, Profile


class TabSerializer(serializers.ModelSerializer):
    # Вычисляемые поля из owner.profile (в базе их нет)
    author_name = serializers.CharField(source='owner_display_name', read_only=True)
    avatar_file = serializers.SerializerMethodField()
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Tab
        fields = [
            'id', 'owner', 'title', 'data', 'is_public', 'is_active',
            'comment', 'author_name', 'audio_file', 'avatar_file',
            'tab_file', 'file_format', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'owner',
            'is_active',
            'created_at',
            'updated_at'
        ]

    def get_avatar_file(self, obj):
        av = obj.owner_avatar
        if not av:
            return None
        request = self.context.get('request')
        url = av.url
        return request.build_absolute_uri(url) if request else url


class UserProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', required=False, allow_blank=True)
    avatar = serializers.SerializerMethodField()
    personal_link = serializers.CharField(source='profile.personal_link', required=False, allow_blank=True)
    account_status = serializers.CharField(source='profile.account_status', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'display_name', 'avatar', 'personal_link', 'account_status']

    def get_avatar(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.avatar:
            return None
        request = self.context.get('request')
        url = profile.avatar.url
        return request.build_absolute_uri(url) if request else url


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    display_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'display_name']

    def create(self, validated_data):
        display_name = validated_data.pop('display_name', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        
        if display_name:
            user.profile.display_name = display_name
            user.profile.save()

        Token.objects.create(user=user)
        return user