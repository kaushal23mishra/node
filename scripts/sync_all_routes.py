import os
import re
import yaml

def parse_routes(root_dir):
    paths_dict = {}
    
    # Regex to find router.route('/path').method
    # Captures path in group 1 and methods in subsequent chaining
    route_regex = re.compile(r"router\.route\(['\"]([^'\"]+)['\"]\)\.([a-z]+)")
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.js'):
                file_path = os.path.join(root, file)
                # Determine tag from filename
                tag = file.replace('Routes.js', '').replace('.js', '').capitalize()
                
                with open(file_path, 'r') as f:
                    content = f.read()
                    matches = route_regex.findall(content)
                    
                    for path, method in matches:
                        if path not in paths_dict:
                            paths_dict[path] = {}
                        
                        # Replace express path params :id with {id}
                        swagger_path = re.sub(r':([a-zA-Z0-9_]+)', r'{\1}', path)
                        
                        if swagger_path not in paths_dict:
                            paths_dict[swagger_path] = {}
                        
                        paths_dict[swagger_path][method] = {
                            "tags": [tag],
                            "summary": f"{method.upper()} {swagger_path}",
                            "responses": {
                                "200": {"description": "OK"}
                            },
                            "security": [{"bearerAuth": []}]
                        }
                        
                        # Add parameters if path has {id}
                        path_params = re.findall(r'{([a-zA-Z0-9_]+)}', swagger_path)
                        if path_params:
                            paths_dict[swagger_path][method]["parameters"] = [
                                {
                                    "name": p,
                                    "in": "path",
                                    "required": True,
                                    "schema": {"type": "string"}
                                } for p in path_params
                            ]

    return paths_dict

if __name__ == "__main__":
    routes_data = parse_routes('./routes')
    
    output = {
        "openapi": "3.0.0",
        "info": {
            "title": "Node DHI Auto-Generated API",
            "version": "1.0.0"
        },
        "paths": routes_data
    }
    
    with open('./docs/api_all.yml', 'w') as f:
        yaml.dump(output, f, sort_keys=False)
    
    print(f"Generated docs/api_all.yml with {len(routes_data)} paths")
