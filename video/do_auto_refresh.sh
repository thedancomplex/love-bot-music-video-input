echo 'Auto upload x.val and y.val'
THE_PASS=$(cat ~/.pass/lb-music.pass)
THE_DIR='~/lb-music.d/'
mkdir -p $THE_DIR
while [ 1 -gt 0 ]
do
        sshpass -p $THE_PASS scp *.val lovebot@love-bot.xyz:$THE_DIR
        echo -n '.'
        sleep 1
done

