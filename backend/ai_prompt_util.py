# This function dictates the prompt given to the AI based on the mode given
# to the function
def prompt_builder(mode):
    import os
    
    # Map mode names to file names
    mode_to_file = {
        "Definition": "definition.txt",
        "ELI5": "eli5.txt", 
        "Real world analogy": "real_world_analogy.txt"
    }
    
    # Get the filename for this mode
    filename = mode_to_file.get(mode, "definition.txt")  # Default to definition
    
    # Read from the prompts directory
    prompts_dir = "/app/prompts"  # This will be mounted from Docker
    file_path = os.path.join(prompts_dir, filename)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read().strip()


# This function controls the temperature value given to the AI based on the mode
# higher temperature = more creative explaination
# lower temperature = more scientific explaination
def ai_temperature_control(mode):
    temperature = 0.6
    if mode == "Definition":
        temperature = 0.0
    elif mode == "Real world analogy":
        temperature = 0.2
    
    return temperature
