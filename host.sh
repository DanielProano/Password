#! /bin/bash

sudo docker build -t frontend .

sudo docker run -p 5173:5173 frontend
