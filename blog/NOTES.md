https://www.howtogeek.com/devops/how-to-quickly-deploy-wordpress-as-a-docker-container/


docker-compose up -d

// Another run at it.

https://upcloud.com/resources/tutorials/wordpress-with-docker

docker run -e MYSQL_ROOT_PASSWORD=Nirvana8484 -e MYSQL_DATABASE=wordpress --name wordpressdb -v "$PWD/database":/var/lib/mysql -d mariadb:latest
