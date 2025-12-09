from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
import sqlite3
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    conn = sqlite3.connect('glory_panel.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  password_hash TEXT,
                  created_at TIMESTAMP)''')
    
    # Accounts table
    c.execute('''CREATE TABLE IF NOT EXISTS accounts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  uid TEXT UNIQUE,
                  token TEXT,
                  glory INTEGER DEFAULT 0,
                  clan_id TEXT,
                  status TEXT DEFAULT 'inactive',
                  created_at TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users(id))''')
    
    # Clan requests table
    c.execute('''CREATE TABLE IF NOT EXISTS clan_requests
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  account_id INTEGER,
                  clan_id TEXT,
                  status TEXT DEFAULT 'pending',
                  created_at TIMESTAMP,
                  FOREIGN KEY (account_id) REFERENCES accounts(id))''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Simple authentication (in production use proper auth)
    if username == 'admin' and password == 'admin123':
        return jsonify({
            'success': True,
            'message': 'تم تسجيل الدخول بنجاح',
            'token': 'demo_token_123'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'بيانات الدخول غير صحيحة'
        }), 401

@app.route('/api/accounts', methods=['GET', 'POST'])
def manage_accounts():
    if request.method == 'GET':
        # Get all accounts
        conn = sqlite3.connect('glory_panel.db')
        c = conn.cursor()
        
        c.execute('SELECT * FROM accounts')
        accounts = []
        for row in c.fetchall():
            accounts.append({
                'id': row[0],
                'uid': row[2],
                'glory': row[4],
                'clan_id': row[5],
                'status': row[6]
            })
        
        conn.close()
        return jsonify({'success': True, 'accounts': accounts})
    
    elif request.method == 'POST':
        # Add new account
        data = request.json
        uid = data.get('uid')
        token = data.get('token')
        clan_id = data.get('clan_id')
        
        try:
            conn = sqlite3.connect('glory_panel.db')
            c = conn.cursor()
            
            c.execute('''INSERT INTO accounts (uid, token, clan_id, created_at)
                         VALUES (?, ?, ?, ?)''',
                     (uid, token, clan_id, datetime.now()))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'تم إضافة الحساب بنجاح',
                'account_id': c.lastrowid
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'خطأ: {str(e)}'
            }), 400

@app.route('/api/start_farming/<int:account_id>', methods=['POST'])
def start_farming(account_id):
    try:
        conn = sqlite3.connect('glory_panel.db')
        c = conn.cursor()
        
        c.execute('UPDATE accounts SET status = "active" WHERE id = ?', (account_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'بدأ جمع القلوري'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ: {str(e)}'
        }), 400

@app.route('/api/stop_farming/<int:account_id>', methods=['POST'])
def stop_farming(account_id):
    try:
        conn = sqlite3.connect('glory_panel.db')
        c = conn.cursor()
        
        c.execute('UPDATE accounts SET status = "inactive" WHERE id = ?', (account_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'توقف جمع القلوري'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ: {str(e)}'
        }), 400

@app.route('/api/send_invites', methods=['POST'])
def send_invites():
    data = request.json
    clan_id = data.get('clan_id')
    count = data.get('count', 10)
    
    # Simulate sending invites
    return jsonify({
        'success': True,
        'message': f'تم إرسال {count} دعوة إلى الكلان {clan_id}'
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = sqlite3.connect('glory_panel.db')
    c = conn.cursor()
    
    # Get account stats
    c.execute('SELECT COUNT(*) FROM accounts')
    total_accounts = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM accounts WHERE status = "active"')
    active_accounts = c.fetchone()[0]
    
    c.execute('SELECT SUM(glory) FROM accounts')
    total_glory = c.fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'success': True,
        'stats': {
            'total_accounts': total_accounts,
            'active_accounts': active_accounts,
            'total_glory': total_glory,
            'today_glory': int(total_glory * 0.1)  # Simulate 10% of total as today's glory
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
