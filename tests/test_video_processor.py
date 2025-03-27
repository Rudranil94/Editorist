import pytest
from pathlib import Path
from app.core.video_processor import VideoProcessor
from app.core.config import settings

@pytest.fixture
def video_processor():
    return VideoProcessor()

@pytest.fixture
def sample_video_path(tmp_path):
    # Create a dummy video file for testing
    video_path = tmp_path / "test_video.mp4"
    video_path.touch()
    return str(video_path)

def test_load_video(video_processor, sample_video_path):
    # Test loading a video file
    assert video_processor.load_video(sample_video_path) is True

def test_detect_scenes(video_processor, sample_video_path):
    # Test scene detection
    video_processor.load_video(sample_video_path)
    scenes = video_processor.detect_scenes()
    assert isinstance(scenes, list)

def test_apply_color_grading(video_processor, sample_video_path):
    # Test color grading application
    video_processor.load_video(sample_video_path)
    assert video_processor.apply_color_grading("cinematic") is True

def test_add_transitions(video_processor, sample_video_path):
    # Test adding transitions
    video_processor.load_video(sample_video_path)
    video_processor.detect_scenes()
    assert video_processor.add_transitions("fade") is True

def test_export_video(video_processor, sample_video_path, tmp_path):
    # Test video export
    video_processor.load_video(sample_video_path)
    output_path = str(tmp_path / "output.mp4")
    assert video_processor.export_video(output_path) is True

def test_cleanup(video_processor, sample_video_path):
    # Test resource cleanup
    video_processor.load_video(sample_video_path)
    video_processor.cleanup()
    assert video_processor.current_video is None
    assert len(video_processor.scenes) == 0 