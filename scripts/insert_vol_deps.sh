#!/bin/sh
mysqlimport -d -u root --fields-terminated-by=',' --local --ignore-lines=1 --lines-terminated-by='\r' -v --force spark ../migrations/vol_departments.csv
