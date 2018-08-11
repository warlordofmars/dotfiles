# Functionality

View the Jenkins build status of your project inside Visual Studio Code.

![screenshot](https://github.com/eramitmittal/vscode-jenkins-status/raw/master/images/jenkins-screenshot.png)

# Installation

Press `F1` in VSCode, type `ext install` and then look for `jenkins`.

# Usage

It is automatically enabled if you have a `.jenkins` file in the root folder of your project. The only required information is the `url` pointing to your Jenkins job. 

> _new in version 0.4.0_

If you need _authentication_, just add `username` and `password_or_token` in the `.jenkins` file and you are ready to go.


```json
[{
	"name": "Jenkins build job",
    "url": "http://127.0.0.1:8080/job/myproject",
    "username": "jenkins_user",
    "password": "jenkins_password_or_token"
},
{
	"name": "Jenkins test job",
    "url": "http://127.0.0.1:8080/job/myproject",
    "username": "jenkins_user",
    "password": "jenkins_password_or_token"
}
]
``` 

## Available commands

* **Jenkins: Open in Jenkins:** Open the Jenkins project in you browser 
* **Jenkins: Update Status:** Manually update the status of Jenkins projects

![Commands](https://github.com/eramitmittal/vscode-jenkins-status/raw/master/images/jenkins-commands.png)

## Available settings

* Interval (in minutes) to automatically update the status
```json
    "jenkins.polling": 2
```
> Note: 0 (zero) means _no update_

# Participate

If you have any idea, feel free to create issues and pull requests

# License

[MIT](https://github.com/eramitmittal/vscode-jenkins-status/blob/master/LICENSE.md) &copy; Alessandro Fragnani (Original Author), Amit Mittal (Author of this fork)