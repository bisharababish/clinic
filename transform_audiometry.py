import re

# Read the Ultrasound.tsx file
with open('frontend/pages/Ultrasound.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace component name
content = content.replace('const Ultrasound =', 'const Audiometry =')
content = content.replace('export default Ultrasound;', 'export default Audiometry;')

# Replace translation keys
content = re.sub(r"t\('ultrasound\.", "t('audiometry.", content)

# Replace database table and bucket names
content = content.replace('ultrasound_images', 'audiometry_images')
content = content.replace('ultrasound-images', 'audiometry-images')
content = content.replace('bethlehemmedcenter.com/ultrasound', 'bethlehemmedcenter.com/audiometry')

# Replace state variables
content = re.sub(r'const \[selectedBodyParts, setSelectedBodyParts\] = useState<string\[\]>\(\[\]\);', 'const [notes, setNotes] = useState("");', content)
content = re.sub(r'const \[clinicalIndication, setClinicalIndication\] = useState\(""\);', '', content)

# Remove handleBodyPartToggle function completely
content = re.sub(r'  // Handle body parts selection with toggle\s+const handleBodyPartToggle = \(bodyPart: string\) => \{.*?\n  \};', '', content, flags=re.DOTALL)

# Write to Audiometry.tsx
with open('frontend/pages/Audiometry.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Transformation complete!')
