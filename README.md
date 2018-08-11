dotfiles
========

Script [scripts/setup](scripts/setup) will replace any existing dotfiles found in your $HOME directory with symbolic links to the corresponding dotfile located in this repository.

To run the script:

    ./scripts/setup

It should generate some output similar to this:

    $ ./scripts/setup
    /Users/john/.aliases -> /Users/john/.dotfiles/.aliases
    /Users/john/.bash_profile -> /Users/john/.dotfiles/.bash_profile
    /Users/john/.bash_prompt -> /Users/john/.dotfiles/.bash_prompt
    /Users/john/.bashrc -> /Users/john/.dotfiles/.bashrc
    /Users/john/.curlrc -> /Users/john/.dotfiles/.curlrc
    /Users/john/.exports -> /Users/john/.dotfiles/.exports
    /Users/john/.functions -> /Users/john/.dotfiles/.functions
    /Users/john/.git
    /Users/john/.git -> /Users/john/.dotfiles/.git/
    /Users/john/.gitattributes -> /Users/john/.dotfiles/.gitattributes
    /Users/john/.gitconfig -> /Users/john/.dotfiles/.gitconfig
    /Users/john/.gitignore -> /Users/john/.dotfiles/.gitignore
    /Users/john/.hushlogin -> /Users/john/.dotfiles/.hushlogin
    /Users/john/.inputrc -> /Users/john/.dotfiles/.inputrc
    /Users/john/.screenrc -> /Users/john/.dotfiles/.screenrc
    /Users/john/.vim
    /Users/john/.vim -> /Users/john/.dotfiles/.vim/
    /Users/john/.vimrc -> /Users/john/.dotfiles/.vimrc
    /Users/john/.wgetrc -> /Users/john/.dotfiles/.wgetrc

It will also be installing the Solarized Dark color scheme for iTerm2.  This will open a new dialog window for you to allow this, or ignore if it is already present.