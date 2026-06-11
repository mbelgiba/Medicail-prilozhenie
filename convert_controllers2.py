import os
import re

def rewrite_controller(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Drop mongo imports
    content = re.sub(r'\n\s*"go\.mongodb\.org/mongo-driver/bson"', '', content)
    content = re.sub(r'\n\s*"go\.mongodb\.org/mongo-driver/bson/primitive"', '', content)
    
    # Context boilerplate
    content = re.sub(r'\s*ctx, cancel := context\.WithTimeout\(context\.Background\(\), 10\*time\.Second\)\n\s*defer cancel\(\)\n', '\n', content)
    
    # 1. CountDocuments
    # count, _ := collection.CountDocuments(ctx, bson.M{"email": input.Email})
    content = re.sub(
        r'([a-zA-Z0-9_]+), [^=]+=\s*(?:config\.GetCollection\("[^"]+"\)|collection)\.CountDocuments\([^,]+,\s*bson\.M{([^}]+)}\)',
        r'var \1 int64\n\tconfig.DB.Model(&models.User{}).Where("\2").Count(&\1)',
        content
    )
    
    # Fix the Where string format from bson.M{"email": input.Email} -> "email = ?", input.Email
    def fix_where(m):
        inner = m.group(1)
        # very simple transform for common equality: "field": var -> "field = ?", var
        inner = re.sub(r'"([^"]+)":\s*([^,]+)', r'"\1 = ?", \2', inner)
        return f'Where({inner})'
    
    content = re.sub(r'Where\("([^"]+)"\)', fix_where, content)

    # 2. InsertOne
    # _, err = collection.InsertOne(ctx, user)
    content = re.sub(
        r'_,?\s*err\s*(=|:=)\s*(?:config\.GetCollection\("[^"]+"\)|collection)\.InsertOne\([^,]+,\s*([^)]+)\)',
        r'err \1 config.DB.Create(&\2).Error',
        content
    )
    content = re.sub(
        r'if _, err := (?:config\.GetCollection\("[^"]+"\)|collection)\.InsertOne\([^,]+,\s*([^)]+)\);\s*err != nil {',
        r'if err := config.DB.Create(&\1).Error; err != nil {',
        content
    )

    # 3. FindOne
    # err := collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
    content = re.sub(
        r'(?:err := )?(?:config\.GetCollection\("[^"]+"\)|collection)\.FindOne\([^,]+,\s*bson\.M{([^}]+)}\)\.Decode\(&([a-zA-Z0-9_]+)\)',
        r'err := config.DB.Where("\1").First(&\2).Error',
        content
    )
    content = re.sub(r'Where\("([^"]+)"\)', fix_where, content)

    # 4. Find (All)
    # cursor, err := collection.Find(ctx, bson.M{"user_id": c.GetString("userID")})
    # if err != nil ...
    # defer cursor.Close(ctx)
    # err := cursor.All(ctx, &appointments)
    # This block is too big to regex safely. I will replace it with a simpler string replacement.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

controllers_dir = 'backend/controllers'
for filename in os.listdir(controllers_dir):
    if filename.endswith('.go'):
        rewrite_controller(os.path.join(controllers_dir, filename))

