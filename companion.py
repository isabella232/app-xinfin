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

def getPublicKey(index):

    try:
        print("Getting Public Key : \n")
        i = int(index)

        resp1 = dongle.exchange(bytearray([
            0xE0,
            0x02,
            0x00,
            0x00,
            0x00,
            i
        ]))
        publicKey1 = "xdc" + resp1[67:107].decode("utf-8")
        print("Public Key at index {} :".format(i), publicKey1)

        resp2 = dongle.exchange(bytearray([
            0xE0,
            0x02,
            0x01,
            0x01,
            0x00,
            i
        ]))

        publicKey2 = "xdc" + resp2[67:107].decode("utf-8")
        if(publicKey1 != publicKey2):
            raise Exception("An error occurred")
    
    except Exception as e:
        print("An Exception occured \n", e)

parser = argparse.ArgumentParser(description="Do Something")

parser.add_argument("--version", help = "Get Version of your app", action="store_true")
parser.add_argument("--publickey", help = "Get Public Key", action="store")

args = parser.parse_args()

if(args.version):
    GetVersion()

if(args.publickey):
    getPublicKey(args.publickey)