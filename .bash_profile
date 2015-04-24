# Source boxen stuff
source /opt/boxen/env.sh

# Add `~/bin` to the `$PATH`
export PATH="$HOME/bin:$PATH";

# Load the shell dotfiles, and then some:
# * ~/.path can be used to extend `$PATH`.
# * ~/.extra can be used for other settings you don’t want to commit.
for file in ~/.{path,bash_prompt,exports,aliases,functions,extra}; do
	[ -r "$file" ] && [ -f "$file" ] && source "$file";
done;
unset file;

# Case-insensitive globbing (used in pathname expansion)
shopt -s nocaseglob;

# Append to the Bash history file, rather than overwriting it
shopt -s histappend;

# Autocorrect typos in path names when using `cd`
shopt -s cdspell;

# Enable some Bash 4 features when possible:
# * `autocd`, e.g. `**/qux` will enter `./foo/bar/baz/qux`
# * Recursive globbing, e.g. `echo **/*.txt`
for option in autocd globstar; do
	shopt -s "$option" 2> /dev/null;
done;

# Add tab completion for many Bash commands
if which brew > /dev/null && [ -f "$(brew --prefix)/etc/bash_completion" ]; then
	source "$(brew --prefix)/etc/bash_completion";
elif [ -f /etc/bash_completion ]; then
	source /etc/bash_completion;
fi;

# Enable tab completion for `g` by marking it as an alias for `git`
if type _git &> /dev/null && [ -f /usr/local/etc/bash_completion.d/git-completion.bash ]; then
	complete -o default -o nospace -F _git g;
fi;

# Add tab completion for SSH hostnames based on ~/.ssh/config, ignoring wildcards
[ -e "$HOME/.ssh/config" ] && complete -o "default" -o "nospace" -W "$(grep "^Host" ~/.ssh/config | grep -v "[?*]" | cut -d " " -f2 | tr ' ' '\n')" scp sftp ssh;

# Add tab completion for `defaults read|write NSGlobalDomain`
# You could just use `-g` instead, but I like being explicit
complete -W "NSGlobalDomain" defaults;

# Add `killall` tab completion for common apps
complete -o "nospace" -W "Contacts Calendar Dock Finder Mail Safari iTunes SystemUIServer Terminal Twitter" killall;

_rdp_complete() {

   # cur will hold the current word being typed 
   local cur 

   # opts will contain all of our possible completion options
   local opts
  
   # Clear out the COMPREPLY array 
   COMPREPLY=()

   # Get the current word being completed
   cur=${COMP_WORDS[COMP_CWORD]}

   # Generate a list of options for completion
   opts=$(for i in $(ls ~/.rdp/*.rdp); do echo $i | sed 's#/Users/carterj/.rdp/\(.*\)\.rdp#\1#'; done)

   # Use compgen to populate the COMPREPLY list to be presented
   COMPREPLY=( $( compgen -W "${opts}" -- "${cur}" ) )

}

rdp(){
	hostname=$1
	rdp_dir=~/.rdp
	#check first if we're trying to rdp to a vagrant instance
	grep -l "$hostname.vm.box =" ~/Projects/*/Vagrantfile &> /dev/null
	if [ $? -eq 0 ]; then
		pwd=`pwd`
		cd $(grep -l "$hostname.vm.box =" ~/Projects/*/Vagrantfile|sed 's/Vagrantfile//')
		vagrant status $hostname | grep $hostname | grep up &> /dev/null
		if [ $? -eq 0 ]; then
			vagrant rdp $hostname
		else
			vagrant up $hostname
			vagrant rdp $hostname
		fi
		cd $pwd
		return
	fi

	#not vagrant, create .rdp file with hostname and launch
	username=prodad\\carterjadm
	rdp_file=$rdp_dir/$hostname.rdp

	(
	cat << EOF
screen mode id:i:3
use multimon:i:0
session bpp:i:32
full address:s:$hostname
audiomode:i:0
username:s:$username
disable wallpaper:i:0
disable full window drag:i:0
disable menu anims:i:0
disable themes:i:0
alternate shell:s:
shell working directory:s:
authentication level:i:2
connect to console:i:0
gatewayusagemethod:i:0
disable cursor setting:i:0
allow font smoothing:i:1
allow desktop composition:i:1
redirectprinters:i:0
bookmarktype:i:3
use redirection server name:i:0
EOF
	) > $rdp_file

	open $rdp_file
}

complete -o default -F _rdp_complete rdp