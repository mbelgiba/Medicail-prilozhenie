import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Imports
    content = re.sub(r'\s*"go\.mongodb\.org/mongo-driver/bson"\n?', '\n', content)
    content = re.sub(r'\s*"go\.mongodb\.org/mongo-driver/bson/primitive"\n?', '\n', content)
    
    # Contexts and collections
    content = re.sub(r'collection := config\.GetCollection\("[^"]+"\)\n?', '', content)
    content = re.sub(r'ctx, cancel := context\.WithTimeout\(context\.Background\(\), 10\*time\.Second\)\n?', '', content)
    content = re.sub(r'defer cancel\(\)\n?', '', content)
    
    # bson.M
    # E.g. bson.M{"email": input.Email} -> we will leave a marker or convert it.
    # It's hard to convert all bson.M safely with regex. 
    # But let's try a simple approach for controllers:
    
    # ID.Hex()
    content = re.sub(r'\b([a-zA-Z0-9_]+)\.ID\.Hex\(\)', r'fmt.Sprint(\1.ID)', content)
    
    # primitive.NewObjectID() -> wait, we removed it from models, it's uint now, so we just remove the field assignment or set it.
    content = re.sub(r'ID:\s*primitive\.NewObjectID\(\),?\n?', '', content)
    
    # primitive.ObjectIDFromHex(idParam)
    content = re.sub(r'([a-zA-Z0-9_]+), err := primitive\.ObjectIDFromHex\(([^\)]+)\)', r'\1 := \2 // TODO convert to uint', content)
    content = re.sub(r'([a-zA-Z0-9_]+), _ := primitive\.ObjectIDFromHex\(([^\)]+)\)', r'\1 := \2 // TODO convert to uint', content)

    # InsertOne
    # _, err = collection.InsertOne(ctx, user) -> err = config.DB.Create(&user).Error
    content = re.sub(r'_,?\s*err\s*=\s*collection\.InsertOne\([^,]+,\s*([^)]+)\)', r'err = config.DB.Create(&\1).Error', content)
    content = re.sub(r'_,?\s*err\s*:=\s*collection\.InsertOne\([^,]+,\s*([^)]+)\)', r'err := config.DB.Create(&\1).Error', content)
    
    # CountDocuments
    # count, _ := collection.CountDocuments(ctx, bson.M{"email": input.Email})
    # This is too complex for regex, I will write a simple sed-like script for common ones.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

controllers_dir = 'backend/controllers'
for filename in os.listdir(controllers_dir):
    if filename.endswith('.go'):
        process_file(os.path.join(controllers_dir, filename))

print("Controllers processed.")
