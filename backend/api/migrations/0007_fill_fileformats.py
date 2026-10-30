from django.db import migrations


FORMATS = [
    ('.gp5',     'application/x-guitar-pro'),
    ('.gp4',     'application/x-guitar-pro'),
    ('.gp3',     'application/x-guitar-pro'),
    ('.mid',     'audio/midi'),
    ('.midi',    'audio/midi'),
    ('.xml',     'application/xml'),
    ('.musicxml','application/vnd.recordare.musicxml+xml'),
]


def add_formats(apps, schema_editor):
    FileFormat = apps.get_model('api', 'FileFormat')
    for ext, mime in FORMATS:
        FileFormat.objects.get_or_create(extension=ext, defaults={'mime_type': mime})


def remove_formats(apps, schema_editor):
    FileFormat = apps.get_model('api', 'FileFormat')
    FileFormat.objects.filter(extension__in=[e for e, _ in FORMATS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_fileformat_options_remove_tab_author_name_and_more'),
    ]

    operations = [
        migrations.RunPython(add_formats, remove_formats),
    ]