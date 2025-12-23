import sys
sys.path.insert(0, '.')
import os
from datetime import datetime, timedelta

# Set environment variable
os.environ['LICENSE_SECRET_KEY'] = 'Jd140SC093N2S9FqwGpwKOTiOLTiUXtdHXICxXhfrcTIZM_dSoariCe7hJLeLhLR'

from utils.license_generator import generate_license_key
from database.db import get_connection

# Generate key
key = generate_license_key('home')
print(f'Generated key: {key}')

# Insert into database
conn = get_connection()
cursor = conn.cursor()

now = datetime.now().isoformat()
expires = (datetime.now() + timedelta(days=365)).isoformat()

cursor.execute('''
    INSERT INTO customer_licenses 
    (license_key, plan, status, max_devices, created_at, expires_at, customer_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', (key, 'home', 'active', 1, now, expires, 'test@test.com'))

conn.commit()
conn.close()

print(f' License created in database!')
print(f'Key: {key}')
print(f'Plan: home')
print(f'Max devices: 1')
print(f'Expires: {expires}')
