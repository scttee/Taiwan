#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
from collections import defaultdict
from pathlib import Path
from typing import Iterable

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.heic', '.webp'}

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
except Exception:  # Pillow is optional
    Image = None
    TAGS = {}


def image_files(folder: Path) -> Iterable[Path]:
    for path in sorted(folder.iterdir()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            yield path


def exif_date_taken(path: Path) -> dt.datetime | None:
    if Image is None:
        return None

    try:
        with Image.open(path) as image:
            exif = image.getexif()
            if not exif:
                return None
            tags = {TAGS.get(key, key): value for key, value in exif.items()}
            date_value = tags.get('DateTimeOriginal') or tags.get('DateTime')
            if not date_value:
                return None
            return dt.datetime.strptime(str(date_value), '%Y:%m:%d %H:%M:%S')
    except Exception:
        return None


def image_timestamp(path: Path) -> dt.datetime:
    exif_value = exif_date_taken(path)
    if exif_value is not None:
        return exif_value
    return dt.datetime.fromtimestamp(path.stat().st_mtime)


def ensure_readme(day_folder: Path) -> None:
    readme_path = day_folder / 'README.md'
    if readme_path.exists():
        return

    readme_path.write_text(
        'Drop sorted images for this day here.\n\n'
        'You can reference them from the matching JSON content file.\n'
    )


def sort_photos(source: Path, destination: Path, manifest_path: Path) -> dict:
    grouped: dict[str, list[Path]] = defaultdict(list)

    for photo in image_files(source):
        day_key = image_timestamp(photo).date().isoformat()
        grouped[day_key].append(photo)

    ordered_days = sorted(grouped)
    manifest = {'generated_at': dt.datetime.utcnow().isoformat() + 'Z', 'days': []}

    for index, day_key in enumerate(ordered_days, start=1):
        folder_name = f'day-{index:03d}'
        day_folder = destination / folder_name
        day_folder.mkdir(parents=True, exist_ok=True)
        ensure_readme(day_folder)

        day_entry = {
            'date': day_key,
            'folder': folder_name,
            'photos': []
        }

        for photo_index, photo in enumerate(sorted(grouped[day_key], key=image_timestamp), start=1):
            target_name = f'photo-{photo_index:02d}{photo.suffix.lower()}'
            target_path = day_folder / target_name
            shutil.copy2(photo, target_path)
            day_entry['photos'].append(str(target_path.as_posix()))

        manifest['days'].append(day_entry)

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description='Sort uploaded trip photos into day folders.')
    parser.add_argument('--source', default='uploads', help='Folder containing unsorted uploaded photos.')
    parser.add_argument('--dest', default='assets/photos', help='Folder to copy sorted photos into.')
    parser.add_argument('--manifest', default='content/photo-manifest.json', help='Output JSON manifest.')
    args = parser.parse_args()

    source = Path(args.source)
    destination = Path(args.dest)
    manifest_path = Path(args.manifest)

    if not source.exists():
        raise SystemExit(f'Source folder not found: {source}')

    manifest = sort_photos(source, destination, manifest_path)
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
