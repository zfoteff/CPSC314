Web Development Day 2: HTML basics and FTP Demo
=========
## Web History
Internet
* Internet began as four networked computers in 1969

FTP: File Transfer Protocol
* Easy method of transferring files over Internet

World Wide Web (Web, The Web)
* Tim Berners-Lee, 1990
* Easy way to communicate files over the Internet

Web Page
* Document that is viewed in a web browser

Website
* Collection of related webpages

Hyper Text Markup Language (HTML)
* Markup language for web documents

Hypertext
* Text that has links to other texts/documents

World Wide Web Consortium (W3C)
* International standards organization that traditionally has controlled web standards
and HTML

Web Hypertext Application Technology Working Group (WHATWG)
* Organization that develops web standards. Members include major browsing vendors

HTML Living Standard
* Standard developed by WHATGW to direct development of the Internet and Internet browsers

## FTP
FTP is used to transfer files by logging into a computer with the files and typing commands to get the desired files  
* sftp is used as a command now as opposed to ftp for security reasons

Cheat sheet: https://learn2torials.com/a/sftp-cheatsheet  
The web uses HTML files, web browsers, and HTTP to provide a more convenient way to communicate. Files contain links to other files
Gonzaga provides a dummy server for students to play around in
* Hostname: zfoteff@barney.gonzaga.edu
* Password: gupassword

Initiating sftp:
* Commands are slightly different than linux
  * prepending l to any command will show local machine information rather than remote
* Sending files from local to remote
  * PUT <file>
* Retrieving a file from remote to local
  * GET <file>
