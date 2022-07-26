echo 'Auto upload djap.png.cropped.color'
THE_PASS=$(cat ~/lb-music.pass)
while [ 1 -gt 0 ]
do
        cp djap.png.cropped.color djap_to_jpg.png
        mogrify -format jpg djap_to_jpg.png
        mv djap_to_jpg.png djap.png.jpg
        sshpass -p $THE_PASS scp djap.png.jpg lovebot@love-bot.xyz:
        sshpass -p $THE_PASS scp djap.png.cropped.color lovebot@love-bot.xyz:
        echo -n '.'
        sleep 10
done

