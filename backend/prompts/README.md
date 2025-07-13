# AI Prompts

This directory contains text files with AI prompts that can be modified without rebuilding the Docker container.

## How it works

- Prompts are stored as `.txt` files
- The Docker container mounts this directory to `/app/prompts`
- Changes to these files take effect immediately (no rebuild needed)

## Available prompts

- `definition.txt` - Standard definition mode
- `eli5.txt` - Explain Like I'm 5 mode  
- `real_world_analogy.txt` - Real world analogy mode

## Making changes

1. Edit any of the `.txt` files
2. Save the file
3. The changes take effect immediately - no Docker rebuild needed!

## File format

- Use plain text
- UTF-8 encoding
- No special formatting required
- The entire file content becomes the prompt 