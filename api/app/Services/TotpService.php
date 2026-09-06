<?php

namespace App\Services;

/**
 * Implémentation TOTP (RFC 6238) en PHP pur, sans dépendance Composer externe
 * (donc installable même sans accès à Packagist). Compatible Google
 * Authenticator / Microsoft Authenticator / toute app TOTP standard.
 *
 * Le QR code lui-même n'est PAS généré côté serveur : on renvoie l'URI
 * "otpauth://" et c'est le frontend qui l'affiche en QR (ex: librairie JS
 * `qrcode.react`), ce qui évite d'avoir besoin d'une lib PHP de rendu d'image.
 */
class TotpService
{
    private const SECRET_LENGTH = 20; // 160 bits, recommandé par la RFC
    private const PERIOD = 30;        // secondes
    private const DIGITS = 6;

    public function generateSecret(): string
    {
        return $this->base32Encode(random_bytes(self::SECRET_LENGTH));
    }

    public function getOtpAuthUri(string $secret, string $accountEmail, string $issuer = 'Dahara Online'): string
    {
        $label = rawurlencode($issuer.':'.$accountEmail);

        return sprintf(
            'otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d',
            $label,
            $secret,
            rawurlencode($issuer),
            self::DIGITS,
            self::PERIOD
        );
    }

    /**
     * Vérifie un code à 6 chiffres, en tolérant +/- 1 fenêtre de 30s
     * pour absorber un léger décalage d'horloge côté utilisateur.
     */
    public function verify(string $secret, string $code, int $window = 1): bool
    {
        $code = preg_replace('/\s+/', '', $code);
        $timestamp = time();

        for ($i = -$window; $i <= $window; $i++) {
            $counter = intdiv($timestamp, self::PERIOD) + $i;
            if (hash_equals($this->generateCode($secret, $counter), $code)) {
                return true;
            }
        }

        return false;
    }

    private function generateCode(string $secret, int $counter): string
    {
        $key = $this->base32Decode($secret);
        $counterBytes = pack('N*', 0, $counter); // 8 octets big-endian

        $hash = hash_hmac('sha1', $counterBytes, $key, true);
        $offset = ord($hash[19]) & 0x0F;

        $binary = ((ord($hash[$offset]) & 0x7F) << 24)
            | ((ord($hash[$offset + 1]) & 0xFF) << 16)
            | ((ord($hash[$offset + 2]) & 0xFF) << 8)
            | (ord($hash[$offset + 3]) & 0xFF);

        return str_pad((string) ($binary % (10 ** self::DIGITS)), self::DIGITS, '0', STR_PAD_LEFT);
    }

    private function base32Encode(string $data): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $bits = '';
        foreach (str_split($data) as $char) {
            $bits .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
        }

        $output = '';
        foreach (str_split($bits, 5) as $chunk) {
            $chunk = str_pad($chunk, 5, '0', STR_PAD_RIGHT);
            $output .= $alphabet[bindec($chunk)];
        }

        return $output;
    }

    private function base32Decode(string $data): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $bits = '';
        foreach (str_split(strtoupper($data)) as $char) {
            $pos = strpos($alphabet, $char);
            if ($pos === false) {
                continue;
            }
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }

        $bytes = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $bytes .= chr(bindec($byte));
            }
        }

        return $bytes;
    }

    public function generateRecoveryCodes(int $count = 8): array
    {
        return collect(range(1, $count))
            ->map(fn () => strtoupper(bin2hex(random_bytes(4))).'-'.strtoupper(bin2hex(random_bytes(4))))
            ->all();
    }
}
