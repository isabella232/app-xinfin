#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#include "os.h"
#include "cx.h"
#include "Utils.h"
#include "chainConfig.h"

extern chain_config_t *chainConfig;

bool rlpCanDecode(uint8_t *buffer, uint32_t bufferLength, bool *valid) {
    if (*buffer <= 0x7f) {
    } else if (*buffer <= 0xb7) {
    } else if (*buffer <= 0xbf) {
        if (bufferLength < (1 + (*buffer - 0xb7))) {
            return false;
        }
        if (*buffer > 0xbb) {
            *valid = false; // arbitrary 32 bits length limitation
            return true;
        }
    } else if (*buffer <= 0xf7) {
    } else {
        if (bufferLength < (1 + (*buffer - 0xf7))) {
            return false;
        }
        if (*buffer > 0xfb) {
            *valid = false; // arbitrary 32 bits length limitation
            return true;
        }
    }
    *valid = true;
    return true;
}

bool rlpDecodeLength(uint8_t *buffer, uint32_t bufferLength,
                     uint32_t *fieldLength, uint32_t *offset, bool *list) {
    if (*buffer <= 0x7f) {
        *offset = 0;
        *fieldLength = 1;
        *list = false;
    } else if (*buffer <= 0xb7) {
        *offset = 1;
        *fieldLength = *buffer - 0x80;
        *list = false;
    } else if (*buffer <= 0xbf) {
        *offset = 1 + (*buffer - 0xb7);
        *list = false;
        switch (*buffer) {
        case 0xb8:
            *fieldLength = *(buffer + 1);
            break;
        case 0xb9:
            *fieldLength = (*(buffer + 1) << 8) + *(buffer + 2);
            break;
        case 0xba:
            *fieldLength =
                (*(buffer + 1) << 16) + (*(buffer + 2) << 8) + *(buffer + 3);
            break;
        case 0xbb:
            *fieldLength = (*(buffer + 1) << 24) + (*(buffer + 2) << 16) +
                           (*(buffer + 3) << 8) + *(buffer + 4);
            break;
        default:
            return false; // arbitrary 32 bits length limitation
        }
    } else if (*buffer <= 0xf7) {
        *offset = 1;
        *fieldLength = *buffer - 0xc0;
        *list = true;
    } else {
        *offset = 1 + (*buffer - 0xf7);
        *list = true;
        switch (*buffer) {
        case 0xf8:
            *fieldLength = *(buffer + 1);
            break;
        case 0xf9:
            *fieldLength = (*(buffer + 1) << 8) + *(buffer + 2);
            break;
        case 0xfa:
            *fieldLength =
                (*(buffer + 1) << 16) + (*(buffer + 2) << 8) + *(buffer + 3);
            break;
        case 0xfb:
            *fieldLength = (*(buffer + 1) << 24) + (*(buffer + 2) << 16) +
                           (*(buffer + 3) << 8) + *(buffer + 4);
            break;
        default:
            return false; // arbitrary 32 bits length limitation
        }
    }

    return true;
}

//Incomplete