#ifndef _XUTILS_H_
#define _XUTILS_H_

#include <stdint.h>

#include "cx.h"

bool rlpDecodeLength(uint8_t *buffer, uint32_t bufferLength, uint32_t *fieldLength, uint32_t *offset, bool * list);

bool rlpCanDecode(uint8_t *buffer, uint32_t bufferLength, bool *valid);

void getAddressFromKey(cx_ecfp_public_key_t *publicKey, uint8_t *out, cx_sha3_t *sha3Context);

void getAddressStringFromKey(cx_ecfp_public_key_t *publicKey, uint8_t *out, cx_sha3_t *sha3Context);

void getAddressStringFromBinary(uint8_t *address, uint8_t *out, cx_sha3_t *sha3Context);

bool adjustDecimals(char *src, uint32_t srcLength, char *target,
                    uint32_t targetLength, uint8_t decimals);

inline int allzeroes(uint8_t *buf, int n) {
  for (int i = 0; i < n; ++i) {
    if (buf[i]) {
      return 0;
    }
  }
  return 1;
}

inline int ismaxint(uint8_t *buf, int n) {
  for (int i = 0; i < n; ++i) {
    if (buf[i] != 0xff) {
      return 0;
    }
  }
  return 1;
}

#endif