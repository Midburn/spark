#!/bin/sh

cd core
npm i >/dev/null 2>&1
npm start >/dev/null 2>&1 &
cd ..

cd sparkModule1
(npm i >/dev/null 2>&1;npm start >/dev/null 2>&1)&
cd ..
cd sparkModule2
(npm i >/dev/null 2>&1;npm start >/dev/null 2>&1)&
cd ..
cd sparkModule3
(npm i >/dev/null 2>&1;npm start >/dev/null 2>&1)&
cd ..
cd sparkModule4
(npm i >/dev/null 2>&1;npm start >/dev/null 2>&1)&
cd ..
