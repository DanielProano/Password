#! /bin/bash

sudo docker build -t frontend .

sudo docker run -d -p 5173:5173 frontend
