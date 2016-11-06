#!/bin/bash
SCRIPT_PATH=$( cd $(dirname $0) ; pwd -P )
if ! screen -list | grep -q "external_watchdog"; then
	screen -S external_watchdog -dm bash -c "cd ${SCRIPT_PATH}; node server.js --config config.json"
	screen -ls
fi
