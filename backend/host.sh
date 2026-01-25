#! /bin/bash

sudo docker build -t backend .

sudo docker run -e JWT_SECRET=23rkf92ekmf4nf4jkl3j43fk4l3.zkl2*klsnImx2$_@x -p 8080:8080 -d backend
