import pytest
import ai_prompt_util # Changed from relative import

# --- Tests for prompt_builder ---

def test_prompt_builder_definition_mode():
    """Verify the prompt for 'Definition' mode is returned."""
    # Arrange
    mode = "Definition"
    # Act
    prompt = ai_prompt_util.prompt_builder(mode)
    # Assert
    assert "Act as an expert in the field" in prompt
    assert "explain in a short sentence what a P value is" in prompt
    assert "under 200 words altogether" in prompt
    assert "Here is an exemplar of the type of response I want from you:" in prompt # Check exemplar presence

def test_prompt_builder_analogy_mode():
    """Verify the prompt for 'Real world analogy' mode is returned."""
    # Arrange
    mode = "Real world analogy"
    # Act
    prompt = ai_prompt_util.prompt_builder(mode)
    # Assert
    assert "Using the same real world analogies and metaphors" in prompt
    assert "under 150 words" in prompt
    assert "Think of it like this: if your chance of stroke is like drawing a losing card" in prompt # Check exemplar

def test_prompt_builder_eli5_mode():
    """Verify the prompt for 'ELI5' mode is returned."""
    # Arrange
    mode = "ELI5"
    # Act
    prompt = ai_prompt_util.prompt_builder(mode)
    # Assert
    assert "explaining the highlighted text to a five year old" in prompt
    assert "under 100 words" in prompt
    assert "your body has little messengers called melatonin" in prompt # Check exemplar

def test_prompt_builder_invalid_mode_defaults_to_definition():
    """Verify an invalid mode defaults to the 'Definition' prompt."""
    # Arrange
    mode = "SomeOtherMode"
    # Act
    prompt = ai_prompt_util.prompt_builder(mode)
    # Assert
    # Check content from the Definition prompt
    assert "Act as an expert in the field" in prompt
    assert "under 200 words altogether" in prompt


# --- Tests for ai_temperature_control ---

def test_ai_temperature_control_definition_mode():
    """Verify temperature for 'Definition' mode is 0.0."""
    # Arrange
    mode = "Definition"
    # Act
    temp = ai_prompt_util.ai_temperature_control(mode)
    # Assert
    assert temp == 0.0

def test_ai_temperature_control_analogy_mode():
    """Verify temperature for 'Real world analogy' mode is 0.2."""
    # Arrange
    mode = "Real world analogy"
    # Act
    temp = ai_prompt_util.ai_temperature_control(mode)
    # Assert
    assert temp == 0.2

def test_ai_temperature_control_eli5_mode_defaults():
    """Verify temperature for 'ELI5' mode defaults to 0.6."""
    # Arrange
    mode = "ELI5"
    # Act
    temp = ai_prompt_util.ai_temperature_control(mode)
    # Assert
    assert temp == 0.6 # Default temperature

def test_ai_temperature_control_invalid_mode_defaults():
    """Verify temperature for an invalid mode defaults to 0.6."""
    # Arrange
    mode = "InvalidMode"
    # Act
    temp = ai_prompt_util.ai_temperature_control(mode)
    # Assert
    assert temp == 0.6 # Default temperature
