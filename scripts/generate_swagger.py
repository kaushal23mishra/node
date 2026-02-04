import os
import re

def add_swagger_to_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # If already documented, skip
    if '@openapi' in content or '@swagger' in content:
        return
    
    # Extract entity name from filename or folder
    path_parts = file_path.split('/')
    entity_name = path_parts[-2].capitalize() if len(path_parts) > 2 else "Resource"
    tag_name = entity_name
    
    # Base path logic (admin, client, device)
    platform = "admin"
    if "controller/admin" in file_path:
        platform = "admin"
    elif "controller/client" in file_path:
        platform = "client"
    elif "controller/device" in file_path:
        platform = "device"

    # Construct internal path (strip extension and parent folders)
    # Controller files are usually named the same as their folder
    file_name = os.path.basename(file_path).replace('.js', '')
    
    swagger_block = f"""/**
 * @openapi
 * tags:
 *   name: {tag_name}
 *   description: {tag_name} management for {platform} platform
 */

/**
 * @openapi
 * /{platform}/{file_name}/list:
 *   post:
 *     tags: [{tag_name}]
 *     summary: Get all {entity_name.lower()}s with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {{ description: Success }}
 */

/**
 * @openapi
 * /{platform}/{file_name}/create:
 *   post:
 *     tags: [{tag_name}]
 *     summary: Create a new {entity_name.lower()}
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {{ description: Created }}
 */

"""
    new_content = swagger_block + content
    with open(file_path, 'w') as f:
        f.write(new_content)
    print(f"Updated {file_path}")

def walk_and_update(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            # Target controller files that are likely the main entry points
            # e.g., controller/admin/user/user.js, controller/admin/product/product.js
            if file.endswith('.js') and file != 'index.js':
                full_path = os.path.join(root, file)
                # Only process files inside a directory that matches their name (common convention in this project)
                parent_dir = os.path.basename(root)
                if file.replace('.js', '') == parent_dir:
                    add_swagger_to_file(full_path)

if __name__ == "__main__":
    # Process admin/client/device controllers
    walk_and_update('./controller/admin')
    walk_and_update('./controller/client')
    walk_and_update('./controller/device')
