#!/bin/bash

SCRIPT_PATH=$(pwd)
command="$SCRIPT_PATH/run_external_watchdog.sh";
reboot="@reboot     $command";
restart="*/5 * * * * $command";

cat <(fgrep -i -v "external_watchdog" <(crontab -l)) <(echo "$reboot") <(echo "$restart") | crontab -; > /dev/null
echo 'added crontab entries for external_watchdog, external_watchdog will start in up to 5 minutes'
crontab -l