import os
import re

def process_models():
    models_dir = 'backend/models'
    for filename in os.listdir(models_dir):
        if not filename.endswith('.go'): continue
        filepath = os.path.join(models_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove mongo primitive import
        content = re.sub(r'"go\.mongodb\.org/mongo-driver/bson/primitive"\n?', '', content)
        
        # Replace primitive.ObjectID with uint
        content = re.sub(r'primitive\.ObjectID', 'uint', content)
        
        # Replace bson:"_id,omitempty" with gorm:"primaryKey"
        content = re.sub(r'bson:"_id,omitempty"', 'gorm:"primaryKey"', content)
        
        # Replace other bson tags with gorm tags
        # e.g., bson:"user_id" -> gorm:"column:user_id"
        def replace_bson(m):
            tag = m.group(1)
            if tag == '-':
                return 'gorm:"-"'
            tag = tag.split(',')[0]
            return f'gorm:"column:{tag}"'
            
        content = re.sub(r'bson:"([^"]+)"', replace_bson, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

process_models()
print("Models processed.")
