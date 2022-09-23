#!/bin/bash

if [[ -z $1 ]]
then
	npx prisma migrate dev --name noName
else
	npx prisma migrate dev --name $1
fi