from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


# 1. Справочник форматов файлов
class FileFormat(models.Model):
    extension = models.CharField(max_length=10)   # .gp5, .mid, .xml
    mime_type = models.CharField(max_length=50)

    class Meta:
        ordering = ['extension']

    def __str__(self):
        return self.extension


# 2. Модель Таба
class Tab(models.Model):
    # Связь с автором (1:N). SET_NULL — если юзера удалят, таб останется (owner = null)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    title = models.CharField(max_length=200, default="Без названия")
    data = models.JSONField(default=list)

    # Статус и состояние
    is_public = models.BooleanField(default=False)   # публичный / приватный
    is_active = models.BooleanField(default=True)    # активен / в корзине

    comment = models.TextField(blank=True, null=True)

    # Файлы
    audio_file = models.FileField(upload_to='audio/', blank=True, null=True)
    tab_file = models.FileField(upload_to='tabs/', blank=True, null=True)
    file_format = models.ForeignKey(
        FileFormat, on_delete=models.SET_NULL, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or f"Tab {self.id}"

    @property
    def owner_display_name(self):
        """Имя автора для отображения (не хранится в БД)."""
        if not self.owner:
            return "Неизвестный автор"
        profile = getattr(self.owner, 'profile', None)
        if profile and profile.display_name:
            return profile.display_name
        return self.owner.username

    @property
    def owner_avatar(self):
        """Аватар автора (не хранится в БД)."""
        profile = getattr(self.owner, 'profile', None)
        if profile and profile.avatar:
            return profile.avatar
        return None


# 3. Модель Профиля (Гитарист)
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    display_name = models.CharField(max_length=100, blank=True, null=True)
    personal_link = models.CharField(max_length=200, blank=True, null=True)
    account_status = models.CharField(max_length=20, default="активен")

    def __str__(self):
        return f"Профиль {self.user.username}"


# 4. Сигналы для автосоздания профиля
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    Profile.objects.get_or_create(user=instance)