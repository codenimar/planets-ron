#!/bin/bash

# Quick Start Script for Development
# This script starts both the PHP backend and React frontend servers

echo "🚀 Starting Planets-Ron Development Environment"
echo ""

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ Error: PHP is not installed"
    echo "Please install PHP 7.4+ and try again"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js and npm, then try again"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start PHP backend server in background
echo "🔧 Starting PHP Backend Server on http://localhost:8888"
cd api
php -S localhost:8888 > ../php-server.log 2>&1 &
PHP_PID=$!
cd ..

# Wait for PHP server to start
sleep 2

# Check if PHP server is running
if ! curl -s http://localhost:8888/check-session.php > /dev/null 2>&1; then
    echo "❌ Error: PHP server failed to start"
    echo "Check php-server.log for details"
    kill $PHP_PID 2>/dev/null
    exit 1
fi

echo "✅ PHP Backend is running (PID: $PHP_PID)"
echo ""

# Save PHP PID to file for cleanup
echo $PHP_PID > .php-server.pid

echo "⚛️  Starting React Development Server on http://localhost:3000"
echo ""
echo "📝 Note: To stop servers, press Ctrl+C or run: ./dev-stop.sh"
echo ""

# Start React dev server (this will run in foreground)
npm start

# Cleanup PHP server when React dev server stops
if [ -f .php-server.pid ]; then
    PHP_PID=$(cat .php-server.pid)
    echo ""
    echo "🛑 Stopping PHP server (PID: $PHP_PID)..."
    kill $PHP_PID 2>/dev/null
    rm .php-server.pid
    echo "✅ Servers stopped"
fi
