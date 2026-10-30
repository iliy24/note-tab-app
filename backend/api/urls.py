from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TabViewSet, user_profile_view
from .views import TabViewSet, user_profile_view, register_view, login_view, logout_view

router = DefaultRouter()
router.register(r'tabs', TabViewSet, basename='tab')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', user_profile_view, name='user-profile'),
     
    # Маршруты для социальной авторизации (Google/VK)
    path('auth/', include('social_django.urls', namespace='social')),

    # НОВЫЕ МАРШРУТЫ ДЛЯ ПОЧТЫ/ПАРОЛЯ:
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]