#!/bin/bash

# Stop Development Servers Script

echo "🛑 Stopping Development Servers..."

# Stop PHP server if PID file exists
if [ -f .php-server.pid ]; then
    PHP_PID=$(cat .php-server.pid)
    if kill -0 $PHP_PID 2>/dev/null; then
        kill $PHP_PID
        echo "✅ PHP server stopped (PID: $PHP_PID)"
    else
        echo "ℹ️  PHP server was not running"
    fi
    rm .php-server.pid
fi

# Try to find and stop PHP server by port
PHP_PID=$(lsof -t -i:8888 2>/dev/null)
if [ ! -z "$PHP_PID" ]; then
    kill $PHP_PID 2>/dev/null
    echo "✅ Stopped PHP server on port 8888 (PID: $PHP_PID)"
fi

# Try to find and stop React dev server by port
REACT_PID=$(lsof -t -i:3000 2>/dev/null)
if [ ! -z "$REACT_PID" ]; then
    kill $REACT_PID 2>/dev/null
    echo "✅ Stopped React dev server on port 3000 (PID: $REACT_PID)"
fi

echo "✅ All servers stopped"
