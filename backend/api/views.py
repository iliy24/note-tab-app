import os
from django.contrib.auth.models import User
from django.contrib.auth import authenticate  # <-- Добавлено для обычного входа
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token  # <-- Добавлено для токенов

from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

from django.db.models import Q
from rest_framework.permissions import BasePermission


from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from .models import Profile



from .models import Tab, FileFormat
# Импортируем RegisterSerializer, который мы создали для регистрации
from .serializers import TabSerializer, UserProfileSerializer, RegisterSerializer


def _detect_file_format(tab_file):
    if not tab_file:
        return None
    ext = os.path.splitext(tab_file.name)[1].lower()
    return FileFormat.objects.filter(extension=ext).first()


class TabPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        is_owner = (
            request.user.is_authenticated
            and obj.owner_id == request.user.id
        )

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return (obj.is_public and obj.is_active) or is_owner

        return is_owner

# ==========================================
# 1. API для Табов
# ==========================================

class TabViewSet(viewsets.ModelViewSet):
    serializer_class = TabSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [TabPermission]

    def get_queryset(self):
        user = self.request.user
        scope = self.request.query_params.get('scope')

        if scope == 'library':
            return Tab.objects.filter(
                is_public=True,
                is_active=True
            )

        if scope == 'my':
            if user.is_authenticated:
                return Tab.objects.filter(owner=user)

            return Tab.objects.none()

        if user.is_authenticated:
            return Tab.objects.filter(
                Q(is_public=True, is_active=True) | Q(owner=user)
            ).distinct()

        return Tab.objects.filter(
            is_public=True,
            is_active=True
        )

    queryset = Tab.objects.all()
    serializer_class = TabSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        qs = Tab.objects.all()
        scope = self.request.query_params.get('scope')

        if scope == 'library':
            return qs.filter(is_public=True, is_active=True)

        if scope == 'my':
            if self.request.user.is_authenticated:
                return qs.filter(owner=self.request.user)
            return qs  # Пока токена нет, возвращаем все (или можно фильтровать)

        return qs

    
   
    
    def perform_create(self, serializer):
        tab_file = self.request.FILES.get('tab_file')
        file_format = _detect_file_format(tab_file)

        serializer.save(
            owner=self.request.user,
            is_active=True,
            file_format=file_format
        )


    def perform_update(self, serializer):
        tab_file = self.request.FILES.get('tab_file')
        file_format = _detect_file_format(tab_file)

        kwargs = {'owner': serializer.instance.owner}
        if file_format:
            kwargs['file_format'] = file_format

        serializer.save(**kwargs)


# ==========================================
# 2. API для Профиля пользователя
# ==========================================

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])  # Только авторизованный пользователь может работать со своим профилем
@parser_classes([MultiPartParser, FormParser, JSONParser])  # Принимаем JSON и файлы из FormData
def user_profile_view(request):
    user = request.user  # Получаем пользователя по токену авторизации
    profile, created = Profile.objects.get_or_create(user=user)  # Получаем профиль или создаём отсутствующий

    if request.method == 'GET':
        serializer = UserProfileSerializer(user, context={'request': request})  # Формируем данные профиля
        return Response(serializer.data)  # Возвращаем имя, аватар и другие поля

    if request.method == 'PUT':
        display_name = request.data.get('display_name')  # Читаем новое отображаемое имя
        avatar = request.FILES.get('avatar')  # Получаем загруженную фотографию, если она есть

        if display_name is not None:
            display_name = str(display_name).strip()  # Удаляем пробелы по краям имени

            if len(display_name) > 100:
                return Response(
                    {'display_name': ['Имя не должно превышать 100 символов.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.display_name = display_name  # Меняем только отображаемое имя, не логин

        if avatar is not None:
            if avatar.size > 5 * 1024 * 1024:
                return Response(
                    {'avatar': ['Размер изображения не должен превышать 5 МБ.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            from django.core.exceptions import ValidationError
            from django.core.validators import validate_image_file_extension
            from PIL import Image, UnidentifiedImageError

            try:
                validate_image_file_extension(avatar)  # Проверяем допустимое расширение файла
                image = Image.open(avatar)  # Проверяем, что файл является изображением
                image.verify()  # Проверяем структуру изображения
                avatar.seek(0)  # Возвращаем указатель файла в начало перед сохранением
            except (ValidationError, UnidentifiedImageError, OSError, ValueError):
                return Response(
                    {'avatar': ['Выберите корректное изображение JPEG, PNG или другого поддерживаемого формата.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.avatar = avatar  # Сохраняем новую фотографию в поле профиля

        profile.save()  # Записываем изменения в базу и сохраняем загруженный файл

        serializer = UserProfileSerializer(user, context={'request': request})  # Получаем обновлённые данные
        return Response(serializer.data)  # Отправляем их обратно в React

    if request.method == 'DELETE':
        Tab.objects.filter(owner=user).update(owner=None)  # Отвязываем табулатуры от удаляемого пользователя
        user.delete()  # Удаляем только текущий авторизованный аккаунт
        return Response({'message': 'Аккаунт удалён'}, status=status.HTTP_200_OK)

# ==========================================
# 3. API для Регистрации и Входа (по почте/логину)
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user": UserProfileSerializer(
                user,
                context={'request': request}
            ).data
        }, status=status.HTTP_201_CREATED)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserProfileSerializer(user, context={'request': request}).data
        }, status=status.HTTP_200_OK)
    return Response({"error": "Неверный логин или пароль"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    if request.user.is_authenticated:
        Token.objects.filter(user=request.user).delete()
        return Response({"message": "Вы вышли из аккаунта"}, status=status.HTTP_200_OK)
    return Response({"error": "Вы не авторизованы"}, status=status.HTTP_400_BAD_REQUEST)