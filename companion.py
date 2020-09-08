from ledgerblue.comm import getDongle
import argparse
import sys

dongle = getDongle()

def GetVersion():

    try:
        resp = dongle.exchange(bytearray([0xE0, 0x06, 0x00, 0x00]))

        if(len(resp) != 4):
            raise Exception("Invalid Response")
        
        print("Companion App Version : v1.0.0")
        print("App Version : v{}.{}.{}".format(resp[1], resp[2], resp[3]))
    
    except Exception as e:
        print("An exception occured \n", e)


parser = argparse.ArgumentParser(description="Do Something")

parser.add_argument("--version", help = "Get Version of your app", action="store_true")

args = parser.parse_args()

if(args.version):
    GetVersion()